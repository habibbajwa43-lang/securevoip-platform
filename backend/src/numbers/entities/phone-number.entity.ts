import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum NumberStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  PORTING = 'porting',
  SUSPENDED = 'suspended',
  RELEASED = 'released',
}

export enum NumberType {
  LOCAL = 'local',
  TOLL_FREE = 'toll_free',
  MOBILE = 'mobile',
  NATIONAL = 'national',
  SHARED_COST = 'shared_cost',
}

@Entity('phone_numbers')
export class PhoneNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 20 })
  number: string;

  @Column({ name: 'friendly_name', nullable: true })
  friendlyName: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({
    type: 'enum',
    enum: NumberStatus,
    default: NumberStatus.AVAILABLE,
  })
  status: NumberStatus;

  @Column({
    type: 'enum',
    enum: NumberType,
    default: NumberType.LOCAL,
  })
  type: NumberType;

  @Column({ name: 'country_code', length: 5 })
  countryCode: string;

  @Column({ name: 'area_code', length: 10, nullable: true })
  areaCode: string;

  @Column({ name: 'region', nullable: true })
  region: string;

  @Column({ name: 'city', nullable: true })
  city: string;

  @Column({ name: 'monthly_cost', type: 'decimal', precision: 10, scale: 4, default: 0 })
  monthlyCost: number;

  @Column({ name: 'setup_cost', type: 'decimal', precision: 10, scale: 4, default: 0 })
  setupCost: number;

  @Column({ name: 'voice_enabled', default: true })
  voiceEnabled: boolean;

  @Column({ name: 'sms_enabled', default: true })
  smsEnabled: boolean;

  @Column({ name: 'mms_enabled', default: false })
  mmsEnabled: boolean;

  @Column({ name: 'fax_enabled', default: false })
  faxEnabled: boolean;

  @Column({ name: 'is_default_caller_id', default: false })
  isDefaultCallerId: boolean;

  @Column({ name: 'caller_id_name', length: 100, nullable: true })
  callerIdName: string;

  @Column({ name: 'routing_rules', type: 'jsonb', default: {} })
  routingRules: {
    forwardTo?: string;
    forwardOnBusy?: string;
    forwardOnNoAnswer?: string;
    forwardOnUnreachable?: string;
    ivr?: any;
    voicemail?: boolean;
    voicemailEmail?: string;
  };

  @Column({ name: 'provider', default: 'twilio' })
  provider: string;

  @Column({ name: 'provider_sid', nullable: true })
  providerSid: string;

  @Column({ name: 'porting_status', nullable: true })
  portingStatus: string;

  @Column({ name: 'ported_from', nullable: true })
  portedFrom: string;

  @Column({ name: 'porting_requested_at', type: 'timestamp', nullable: true })
  portingRequestedAt: Date;

  @Column({ name: 'porting_completed_at', type: 'timestamp', nullable: true })
  portingCompletedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'auto_renew', default: true })
  autoRenew: boolean;

  @Column({ name: 'last_billed_at', type: 'timestamp', nullable: true })
  lastBilledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
