import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as TwilioLib from 'twilio';
import { Call, CallStatus, CallDirection } from './entities/call.entity';
import { PhoneNumber } from '../numbers/entities/phone-number.entity';
import { User } from '../users/entities/user.entity';

interface InitiateCallParams {
  userId: string;
  fromNumber: string;
  toNumber: string;
  callType: 'voice' | 'video';
}

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);
  private twilioClient: any;

  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,
    @InjectRepository(PhoneNumber)
    private readonly phoneNumberRepository: Repository<PhoneNumber>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.twilioClient = new (TwilioLib as any)(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  // ─── Initiate Call ──────────────────────────────────────────────────────────
  async initiateCall(params: InitiateCallParams): Promise<Call> {
    const { userId, fromNumber, toNumber, callType } = params;

    // Validate caller owns the from number
    const phoneNumber = await this.phoneNumberRepository.findOne({
      where: { number: fromNumber, userId },
    });

    if (!phoneNumber) {
      throw new BadRequestException('You do not own this phone number');
    }

    // Check user DND status
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user?.dndEnabled) {
      throw new BadRequestException('Cannot make calls while DND is active');
    }

    // Check wallet balance (minimum $0.05 to start call)
    if (user.walletBalance < 0.05) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Apply call routing rules
    const routedNumber = await this.applyCallRoutingRules(phoneNumber, toNumber);

    // Create call record
    const call = this.callRepository.create({
      userId,
      fromNumber,
      toNumber: routedNumber,
      direction: CallDirection.OUTBOUND,
      status: CallStatus.RINGING,
      callType,
      startTime: new Date(),
    });

    await this.callRepository.save(call);

    this.eventEmitter.emit('call.initiated', { call, user });
    this.logger.log(`📞 Call initiated: ${call.id} (${fromNumber} → ${routedNumber})`);

    return call;
  }

  // ─── Incoming Call (Webhook) ────────────────────────────────────────────────
  async handleIncomingCall(data: {
    callSid: string;
    from: string;
    to: string;
    callStatus: string;
  }): Promise<string> {
    // Find number owner
    const phoneNumber = await this.phoneNumberRepository.findOne({
      where: { number: data.to },
      relations: ['user'],
    });

    if (!phoneNumber) {
      return this.generateTwiMLReject();
    }

    const user = phoneNumber.user;

    // Check DND
    if (user.dndEnabled || (await this.isInDndSchedule(user))) {
      return this.generateTwiMLReject('User unavailable');
    }

    // Create inbound call record
    const call = this.callRepository.create({
      userId: user.id,
      callSid: data.callSid,
      fromNumber: data.from,
      toNumber: data.to,
      direction: CallDirection.INBOUND,
      status: CallStatus.RINGING,
      startTime: new Date(),
    });

    await this.callRepository.save(call);

    // Apply routing rules
    const routingRules = phoneNumber.routingRules;
    if (routingRules?.forwardTo) {
      return this.generateTwiMLForward(routingRules.forwardTo);
    }

    this.eventEmitter.emit('call.incoming', { call, user });

    // Return TwiML to ring the web client
    return this.generateTwiMLDial(data.to);
  }

  // ─── Update Call Status ─────────────────────────────────────────────────────
  async updateCallStatus(callId: string, status: CallStatus | string): Promise<Call> {
    const call = await this.callRepository.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');

    const updates: Partial<Call> = { status: status as CallStatus };

    if (status === CallStatus.IN_PROGRESS && !call.answeredTime) {
      updates.answeredTime = new Date();
    }

    await this.callRepository.update(callId, updates);
    return { ...call, ...updates };
  }

  // ─── End Call ───────────────────────────────────────────────────────────────
  async endCall(callId: string, userId: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
    });

    if (!call) throw new NotFoundException('Call not found');

    const endTime = new Date();
    const duration = call.answeredTime
      ? Math.floor((endTime.getTime() - call.answeredTime.getTime()) / 1000)
      : 0;

    // Calculate cost (example: $0.02/min for outbound)
    const cost = call.direction === CallDirection.OUTBOUND
      ? parseFloat((Math.ceil(duration / 60) * 0.02).toFixed(4))
      : 0;

    await this.callRepository.update(callId, {
      status: CallStatus.COMPLETED,
      endTime,
      duration,
      cost,
    });

    // Deduct from wallet
    if (cost > 0) {
      await this.userRepository.decrement({ id: userId }, 'walletBalance', cost);
    }

    const updatedCall = await this.callRepository.findOne({ where: { id: callId } });
    this.eventEmitter.emit('call.ended', { call: updatedCall });

    this.logger.log(`📵 Call ended: ${callId} (${duration}s, $${cost})`);
    return updatedCall;
  }

  // ─── Transfer Call ──────────────────────────────────────────────────────────
  async transferCall(callId: string, toNumber: string, userId: string): Promise<void> {
    const call = await this.callRepository.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');
    if (call.userId !== userId) throw new BadRequestException('Not authorized');

    try {
      await this.twilioClient.calls(call.callSid).update({
        twiml: `<Response><Dial>${toNumber}</Dial></Response>`,
      });

      await this.callRepository.update(callId, {
        transferredTo: toNumber,
      });
    } catch (error) {
      throw new BadRequestException(`Transfer failed: ${error.message}`);
    }
  }

  // ─── DTMF ──────────────────────────────────────────────────────────────────
  async sendDtmf(callId: string, digit: string, userId: string): Promise<void> {
    const call = await this.callRepository.findOne({ where: { id: callId } });
    if (!call || !call.callSid) return;

    try {
      await this.twilioClient.calls(call.callSid).update({
        twiml: `<Response><Play digits="${digit}"/></Response>`,
      });
    } catch (error) {
      this.logger.warn(`DTMF failed: ${error.message}`);
    }
  }

  // ─── Hold ──────────────────────────────────────────────────────────────────
  async updateCallHoldStatus(callId: string, onHold: boolean): Promise<void> {
    await this.callRepository.update(callId, { onHold });
  }

  // ─── Get Calls ─────────────────────────────────────────────────────────────
  async getUserCalls(
    userId: string,
    filters: {
      direction?: CallDirection;
      status?: CallStatus;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const { direction, status, fromDate, toDate, page = 1, limit = 20 } = filters;

    const where: any = { userId };
    if (direction) where.direction = direction;
    if (status) where.status = status;
    if (fromDate && toDate) where.startTime = Between(fromDate, toDate);

    const [calls, total] = await this.callRepository.findAndCount({
      where,
      order: { startTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      calls,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────
  async getCallAnalytics(userId: string, period: 'day' | 'week' | 'month') {
    const now = new Date();
    const fromDate = new Date();

    if (period === 'day') fromDate.setDate(now.getDate() - 1);
    else if (period === 'week') fromDate.setDate(now.getDate() - 7);
    else fromDate.setMonth(now.getMonth() - 1);

    const calls = await this.callRepository.find({
      where: { userId, startTime: Between(fromDate, now) },
    });

    const inbound = calls.filter(c => c.direction === CallDirection.INBOUND);
    const outbound = calls.filter(c => c.direction === CallDirection.OUTBOUND);
    const completed = calls.filter(c => c.status === CallStatus.COMPLETED);
    const totalDuration = completed.reduce((acc, c) => acc + (c.duration || 0), 0);
    const totalCost = outbound.reduce((acc, c) => acc + (c.cost || 0), 0);

    return {
      totalCalls: calls.length,
      inboundCalls: inbound.length,
      outboundCalls: outbound.length,
      completedCalls: completed.length,
      missedCalls: calls.filter(c => c.status === CallStatus.NO_ANSWER).length,
      totalDurationSeconds: totalDuration,
      totalDurationFormatted: this.formatDuration(totalDuration),
      totalCost: parseFloat(totalCost.toFixed(4)),
      averageDuration: completed.length > 0 ? Math.floor(totalDuration / completed.length) : 0,
    };
  }

  // ─── Scheduled: Clean up stuck calls ───────────────────────────────────────
  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupStuckCalls() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await this.callRepository.update(
      { status: CallStatus.RINGING, startTime: LessThan(fiveMinutesAgo) },
      { status: CallStatus.NO_ANSWER, endTime: new Date() },
    );
  }

  // ─── TwiML Helpers ─────────────────────────────────────────────────────────
  private generateTwiMLReject(reason?: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Reject reason="${reason || 'busy'}"/>
</Response>`;
  }

  private generateTwiMLForward(toNumber: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="30" callerId="${toNumber}">
    <Number>${toNumber}</Number>
  </Dial>
</Response>`;
  }

  private generateTwiMLDial(toNumber: string): string {
    const wsUrl = this.configService.get('SIP_WS_URL', 'wss://sip.example.com');
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Client>${toNumber}</Client>
  </Dial>
</Response>`;
  }

  private async applyCallRoutingRules(phoneNumber: PhoneNumber, toNumber: string): Promise<string> {
    // Apply call routing rules (forward, IVR, etc.)
    if (phoneNumber.routingRules?.forwardTo && !toNumber.startsWith(phoneNumber.number)) {
      return phoneNumber.routingRules.forwardTo;
    }
    return toNumber;
  }

  private async isInDndSchedule(user: User): Promise<boolean> {
    if (!user.dndSchedule?.enabled) return false;

    const now = new Date();
    const day = now.getDay();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const { days, startTime, endTime } = user.dndSchedule;
    return days.includes(day) && time >= startTime && time <= endTime;
  }

  private formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  }
}



