import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as TwilioLib from 'twilio';
import { PhoneNumber, NumberStatus, NumberType } from './entities/phone-number.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NumbersService {
  private readonly logger = new Logger(NumbersService.name);
  private twilioClient: any;

  constructor(
    @InjectRepository(PhoneNumber)
    private readonly numberRepository: Repository<PhoneNumber>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.twilioClient = new (TwilioLib as any)(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  // ─── Search Available Numbers ───────────────────────────────────────────────
  async searchAvailableNumbers(params: {
    countryCode: string;
    areaCode?: string;
    contains?: string;
    numberType?: NumberType;
    smsEnabled?: boolean;
    mmsEnabled?: boolean;
    limit?: number;
  }) {
    const { countryCode, areaCode, contains, numberType, smsEnabled, mmsEnabled, limit = 20 } = params;

    try {
      // Search in Twilio
      const searchParams: any = {
        limit,
        voiceEnabled: true,
      };

      if (areaCode) searchParams.areaCode = areaCode;
      if (contains) searchParams.contains = contains;
      if (smsEnabled !== undefined) searchParams.smsEnabled = smsEnabled;
      if (mmsEnabled !== undefined) searchParams.mmsEnabled = mmsEnabled;

      let twilioNumbers = [];
      
      if (numberType === NumberType.TOLL_FREE) {
        const result = await this.twilioClient
          .availablePhoneNumbers(countryCode)
          .tollFree.list(searchParams);
        twilioNumbers = result;
      } else {
        const result = await this.twilioClient
          .availablePhoneNumbers(countryCode)
          .local.list(searchParams);
        twilioNumbers = result;
      }

      return twilioNumbers.map((n) => ({
        number: n.phoneNumber,
        friendlyName: n.friendlyName,
        locality: n.locality,
        region: n.region,
        countryCode: n.isoCountry,
        voiceEnabled: n.capabilities.voice,
        smsEnabled: n.capabilities.sms,
        mmsEnabled: n.capabilities.mms,
        monthlyCost: this.getNumberCost(countryCode, numberType),
        setupCost: 0,
      }));
    } catch (error) {
      this.logger.error(`Twilio search failed: ${error.message}`);
      // Fallback to database
      return this.searchDatabaseNumbers(params);
    }
  }

  // ─── Purchase Number ────────────────────────────────────────────────────────
  async purchaseNumber(userId: string, number: string): Promise<PhoneNumber> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if number is already owned
    const existing = await this.numberRepository.findOne({
      where: { number },
    });

    if (existing && existing.status !== NumberStatus.AVAILABLE) {
      throw new BadRequestException('Number is not available for purchase');
    }

    const monthlyCost = this.getNumberCost('US', NumberType.LOCAL);

    // Check wallet balance
    if (user.walletBalance < monthlyCost) {
      throw new BadRequestException(
        `Insufficient balance. Required: $${monthlyCost}, Available: $${user.walletBalance}`,
      );
    }

    let providerSid: string;

    try {
      // Purchase from Twilio
      const twilioNumber = await this.twilioClient.incomingPhoneNumbers.create({
        phoneNumber: number,
        voiceUrl: `${this.configService.get('APP_URL')}/api/v1/calls/webhook/incoming`,
        smsUrl: `${this.configService.get('APP_URL')}/api/v1/messages/webhook/incoming`,
        statusCallback: `${this.configService.get('APP_URL')}/api/v1/calls/webhook/status`,
      });
      providerSid = twilioNumber.sid;
    } catch (error) {
      throw new BadRequestException(`Failed to provision number: ${error.message}`);
    }

    // Save to DB
    const phoneNumber = this.numberRepository.create({
      number,
      userId,
      status: NumberStatus.ACTIVE,
      countryCode: 'US',
      monthlyCost,
      providerSid,
      provider: 'twilio',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      autoRenew: true,
      lastBilledAt: new Date(),
    });

    await this.numberRepository.save(phoneNumber);

    // Deduct cost from wallet
    await this.userRepository.decrement({ id: userId }, 'walletBalance', monthlyCost);

    this.logger.log(`✅ Number purchased: ${number} by user ${userId}`);
    return phoneNumber;
  }

  // ─── Release Number ─────────────────────────────────────────────────────────
  async releaseNumber(userId: string, numberId: string): Promise<{ message: string }> {
    const phoneNumber = await this.numberRepository.findOne({
      where: { id: numberId, userId },
    });

    if (!phoneNumber) throw new NotFoundException('Number not found');

    try {
      if (phoneNumber.providerSid) {
        await this.twilioClient.incomingPhoneNumbers(phoneNumber.providerSid).remove();
      }
    } catch (error) {
      this.logger.warn(`Failed to release from Twilio: ${error.message}`);
    }

    await this.numberRepository.update(numberId, {
      status: NumberStatus.RELEASED,
      userId: null,
    });

    return { message: 'Number released successfully' };
  }

  // ─── Port Number In ─────────────────────────────────────────────────────────
  async portNumberIn(userId: string, portData: {
    number: string;
    accountNumber: string;
    pinOrPassword: string;
    authorizedName: string;
    address: any;
  }): Promise<{ message: string; estimatedDays: number }> {
    // Create porting record
    const phoneNumber = this.numberRepository.create({
      number: portData.number,
      userId,
      status: NumberStatus.PORTING,
      portingStatus: 'submitted',
      portedFrom: 'manual',
      portingRequestedAt: new Date(),
      countryCode: 'US',
    });

    await this.numberRepository.save(phoneNumber);

    // Submit porting request (would integrate with porting API)
    this.logger.log(`📋 Port-in requested: ${portData.number} by ${userId}`);

    return {
      message: 'Porting request submitted. Estimated completion: 3-5 business days.',
      estimatedDays: 5,
    };
  }

  // ─── Get User Numbers ───────────────────────────────────────────────────────
  async getUserNumbers(userId: string) {
    return this.numberRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Update Routing Rules ───────────────────────────────────────────────────
  async updateRoutingRules(
    userId: string,
    numberId: string,
    rules: PhoneNumber['routingRules'],
  ): Promise<PhoneNumber> {
    const phoneNumber = await this.numberRepository.findOne({
      where: { id: numberId, userId },
    });

    if (!phoneNumber) throw new NotFoundException('Number not found');

    await this.numberRepository.update(numberId, { routingRules: rules });
    return { ...phoneNumber, routingRules: rules };
  }

  // ─── Caller ID ──────────────────────────────────────────────────────────────
  async updateCallerId(
    userId: string,
    numberId: string,
    callerIdName: string,
  ): Promise<PhoneNumber> {
    const phoneNumber = await this.numberRepository.findOne({
      where: { id: numberId, userId },
    });

    if (!phoneNumber) throw new NotFoundException('Number not found');

    await this.numberRepository.update(numberId, { callerIdName });
    
    // Update in Twilio
    if (phoneNumber.providerSid) {
      await this.twilioClient.incomingPhoneNumbers(phoneNumber.providerSid).update({
        friendlyName: callerIdName,
      });
    }

    return { ...phoneNumber, callerIdName };
  }

  // ─── Set Default Number ─────────────────────────────────────────────────────
  async setDefaultNumber(userId: string, numberId: string): Promise<void> {
    // Remove existing default
    await this.numberRepository.update(
      { userId, isDefaultCallerId: true },
      { isDefaultCallerId: false },
    );

    await this.numberRepository.update(
      { id: numberId, userId },
      { isDefaultCallerId: true },
    );

    const number = await this.numberRepository.findOne({ where: { id: numberId } });
    if (number) {
      await this.userRepository.update(userId, { defaultCallerId: number.number });
    }
  }

  // ─── Auto-renewal Cron ─────────────────────────────────────────────────────
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processAutoRenewals() {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiringNumbers = await this.numberRepository.find({
      where: { status: NumberStatus.ACTIVE, autoRenew: true },
      relations: ['user'],
    });

    for (const number of expiringNumbers.filter(n => n.expiresAt <= tomorrow)) {
      const user = number.user;
      if (user && user.walletBalance >= number.monthlyCost) {
        await this.userRepository.decrement({ id: user.id }, 'walletBalance', number.monthlyCost);
        await this.numberRepository.update(number.id, {
          expiresAt: new Date(number.expiresAt.getTime() + 30 * 24 * 60 * 60 * 1000),
          lastBilledAt: new Date(),
        });
        this.logger.log(`✅ Auto-renewed: ${number.number}`);
      } else {
        // Suspend number for non-payment
        await this.numberRepository.update(number.id, { status: NumberStatus.SUSPENDED });
        this.logger.warn(`⚠️ Number suspended (insufficient balance): ${number.number}`);
      }
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────
  private getNumberCost(countryCode: string, type?: NumberType): number {
    const costs: Record<string, number> = {
      US_local: 1.0,
      US_toll_free: 2.0,
      GB_local: 1.5,
      CA_local: 1.0,
      AU_local: 2.0,
    };
    return costs[`${countryCode}_${type || 'local'}`] || 1.0;
  }

  private async searchDatabaseNumbers(params: any) {
    const where: any = { status: NumberStatus.AVAILABLE, userId: IsNull() };
    if (params.countryCode) where.countryCode = params.countryCode;
    if (params.areaCode) where.areaCode = params.areaCode;

    return this.numberRepository.find({ where, take: params.limit || 20 });
  }
}



