import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Twilio from 'twilio';
import { Message, MessageStatus, MessageDirection } from './entities/message.entity';
import { PhoneNumber } from '../numbers/entities/phone-number.entity';
import { User } from '../users/entities/user.entity';

interface SendMessageParams {
  userId: string;
  fromNumber: string;
  toNumber: string;
  body: string;
  mediaUrls?: string[];
  scheduledAt?: Date;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private twilioClient: any;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(PhoneNumber)
    private readonly phoneNumberRepository: Repository<PhoneNumber>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.twilioClient = require('twilio')(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  // ─── Send SMS/MMS ───────────────────────────────────────────────────────────
  async sendMessage(params: SendMessageParams): Promise<Message> {
    const { userId, fromNumber, toNumber, body, mediaUrls, scheduledAt } = params;

    // Validate sender owns the number
    const phoneNumber = await this.phoneNumberRepository.findOne({
      where: { number: fromNumber, userId },
    });

    if (!phoneNumber) throw new BadRequestException('You do not own this number');
    if (!phoneNumber.smsEnabled) throw new BadRequestException('SMS not enabled on this number');
    if (mediaUrls?.length && !phoneNumber.mmsEnabled) {
      throw new BadRequestException('MMS not enabled on this number');
    }

    // Check wallet balance
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const cost = mediaUrls?.length ? 0.02 : 0.0075; // MMS vs SMS cost

    if (user.walletBalance < cost) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Create message record
    const message = this.messageRepository.create({
      userId,
      fromNumber,
      toNumber,
      body,
      mediaUrls: mediaUrls || [],
      direction: MessageDirection.OUTBOUND,
      status: scheduledAt ? MessageStatus.SCHEDULED : MessageStatus.QUEUED,
      cost,
      scheduledAt,
    });

    await this.messageRepository.save(message);

    // If scheduled, don't send now
    if (scheduledAt && scheduledAt > new Date()) {
      return message;
    }

    // Send via Twilio
    return this.dispatchMessage(message, user);
  }

  // ─── Dispatch Message via Twilio ─────────────────────────────────────────────
  private async dispatchMessage(message: Message, user: User): Promise<Message> {
    try {
      const twilioParams: any = {
        from: message.fromNumber,
        to: message.toNumber,
        body: message.body,
        statusCallback: `${this.configService.get('APP_URL')}/api/v1/messages/webhook/status`,
      };

      if (message.mediaUrls?.length) {
        twilioParams.mediaUrl = message.mediaUrls;
      }

      const twilioMessage = await this.twilioClient.messages.create(twilioParams);

      await this.messageRepository.update(message.id, {
        messageSid: twilioMessage.sid,
        status: MessageStatus.SENT,
        sentAt: new Date(),
      });

      // Deduct cost
      await this.userRepository.decrement({ id: user.id }, 'walletBalance', message.cost);

      this.eventEmitter.emit('message.sent', { message, user });
      this.logger.log(`✉️ Message sent: ${message.id} (${message.fromNumber} → ${message.toNumber})`);

      return { ...message, status: MessageStatus.SENT, sentAt: new Date() };
    } catch (error) {
      await this.messageRepository.update(message.id, {
        status: MessageStatus.FAILED,
        errorCode: error.code,
        errorMessage: error.message,
      });

      this.logger.error(`❌ Message failed: ${error.message}`);
      throw new BadRequestException(`Failed to send message: ${error.message}`);
    }
  }

  // ─── Handle Incoming SMS/MMS Webhook ────────────────────────────────────────
  async handleIncomingMessage(webhookData: {
    MessageSid: string;
    From: string;
    To: string;
    Body: string;
    NumMedia: string;
    MediaUrl0?: string;
    MediaContentType0?: string;
  }): Promise<string> {
    const mediaUrls: string[] = [];
    const numMedia = parseInt(webhookData.NumMedia, 10);

    for (let i = 0; i < numMedia; i++) {
      const url = (webhookData as any)[`MediaUrl${i}`];
      if (url) mediaUrls.push(url);
    }

    // Find number owner
    const phoneNumber = await this.phoneNumberRepository.findOne({
      where: { number: webhookData.To },
      relations: ['user'],
    });

    if (!phoneNumber) {
      this.logger.warn(`Received message for unknown number: ${webhookData.To}`);
      return '';
    }

    // Save inbound message
    const message = this.messageRepository.create({
      userId: phoneNumber.userId,
      messageSid: webhookData.MessageSid,
      fromNumber: webhookData.From,
      toNumber: webhookData.To,
      body: webhookData.Body,
      mediaUrls,
      direction: MessageDirection.INBOUND,
      status: MessageStatus.DELIVERED,
      receivedAt: new Date(),
    });

    await this.messageRepository.save(message);

    // Emit real-time event
    this.eventEmitter.emit('message.received', {
      message,
      userId: phoneNumber.userId,
    });

    this.logger.log(`📩 Inbound message: ${webhookData.From} → ${webhookData.To}`);
    return ''; // Empty TwiML response
  }

  // ─── Handle Delivery Status Webhook ────────────────────────────────────────
  async handleStatusWebhook(data: {
    MessageSid: string;
    MessageStatus: string;
    ErrorCode?: string;
  }): Promise<void> {
    const statusMap: Record<string, MessageStatus> = {
      queued: MessageStatus.QUEUED,
      sending: MessageStatus.SENT,
      sent: MessageStatus.SENT,
      delivered: MessageStatus.DELIVERED,
      undelivered: MessageStatus.UNDELIVERED,
      failed: MessageStatus.FAILED,
    };

    const status = statusMap[data.MessageStatus] || MessageStatus.FAILED;

    await this.messageRepository.update(
      { messageSid: data.MessageSid },
      {
        status,
        errorCode: data.ErrorCode,
        ...(status === MessageStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
      },
    );
  }

  // ─── Get Conversations ──────────────────────────────────────────────────────
  async getConversations(userId: string, numberFilter?: string) {
    const query = this.messageRepository
      .createQueryBuilder('msg')
      .where('msg.userId = :userId', { userId })
      .select([
        'CASE WHEN msg.direction = \'inbound\' THEN msg.fromNumber ELSE msg.toNumber END AS contact',
        'MAX(msg.createdAt) AS lastMessageAt',
        'COUNT(*) AS messageCount',
        'SUM(CASE WHEN msg.direction = \'inbound\' AND msg.isRead = false THEN 1 ELSE 0 END) AS unreadCount',
      ])
      .groupBy('contact')
      .orderBy('lastMessageAt', 'DESC');

    if (numberFilter) {
      query.andWhere(
        '(msg.fromNumber = :number OR msg.toNumber = :number)',
        { number: numberFilter },
      );
    }

    return query.getRawMany();
  }

  // ─── Get Conversation Messages ──────────────────────────────────────────────
  async getConversationMessages(
    userId: string,
    contact: string,
    page = 1,
    limit = 50,
  ) {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: [
        { userId, fromNumber: contact },
        { userId, toNumber: contact },
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mark inbound as read
    await this.messageRepository.update(
      { userId, fromNumber: contact, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return {
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ─── Schedule Cron ─────────────────────────────────────────────────────────
  @Cron('*/1 * * * *') // Every minute
  async processScheduledMessages() {
    const dueMessages = await this.messageRepository.find({
      where: { status: MessageStatus.SCHEDULED },
    });

    const now = new Date();
    const due = dueMessages.filter(m => m.scheduledAt && m.scheduledAt <= now);

    for (const message of due) {
      const user = await this.userRepository.findOne({ where: { id: message.userId } });
      if (user) {
        await this.dispatchMessage(message, user);
      }
    }
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────
  async getMessageAnalytics(userId: string, period: 'day' | 'week' | 'month') {
    const fromDate = new Date();
    if (period === 'day') fromDate.setDate(fromDate.getDate() - 1);
    else if (period === 'week') fromDate.setDate(fromDate.getDate() - 7);
    else fromDate.setMonth(fromDate.getMonth() - 1);

    const messages = await this.messageRepository.find({
      where: { userId, createdAt: Between(fromDate, new Date()) },
    });

    const inbound = messages.filter(m => m.direction === MessageDirection.INBOUND);
    const outbound = messages.filter(m => m.direction === MessageDirection.OUTBOUND);
    const mms = messages.filter(m => m.mediaUrls?.length > 0);
    const totalCost = outbound.reduce((acc, m) => acc + (m.cost || 0), 0);

    return {
      totalMessages: messages.length,
      inboundSms: inbound.filter(m => !m.mediaUrls?.length).length,
      outboundSms: outbound.filter(m => !m.mediaUrls?.length).length,
      inboundMms: inbound.filter(m => m.mediaUrls?.length > 0).length,
      outboundMms: outbound.filter(m => m.mediaUrls?.length > 0).length,
      deliveryRate: outbound.length > 0
        ? (outbound.filter(m => m.status === MessageStatus.DELIVERED).length / outbound.length) * 100
        : 0,
      totalCost: parseFloat(totalCost.toFixed(4)),
    };
  }
}

