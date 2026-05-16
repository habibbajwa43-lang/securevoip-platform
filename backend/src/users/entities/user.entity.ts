import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  RESELLER = 'reseller',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'pin_hash', select: false, nullable: true })
  pinHash: string;

  @Column({ name: 'qr_secret', select: false, nullable: true })
  qrSecret: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_two_factor_enabled', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ name: 'wallet_balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
  walletBalance: number;

  @Column({ name: 'currency', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'timezone', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ name: 'language', length: 10, default: 'en' })
  language: string;

  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName: string;

  @Column({ name: 'address', type: 'jsonb', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @Column({ name: 'notification_prefs', type: 'jsonb', default: {} })
  notificationPrefs: {
    emailOnCall?: boolean;
    emailOnSms?: boolean;
    emailOnLowBalance?: boolean;
    pushOnCall?: boolean;
    pushOnSms?: boolean;
  };

  @Column({ name: 'dnd_enabled', default: false })
  dndEnabled: boolean;

  @Column({ name: 'dnd_schedule', type: 'jsonb', nullable: true })
  dndSchedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    days: number[];
  };

  @Column({ name: 'caller_id_name', length: 100, nullable: true })
  callerIdName: string;

  @Column({ name: 'default_caller_id', nullable: true })
  defaultCallerId: string;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @Column({ name: 'email_verification_token', nullable: true, select: false })
  emailVerificationToken: string;

  @Column({ name: 'password_reset_token', nullable: true, select: false })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true, select: false })
  passwordResetExpires: Date;

  @Column({ name: 'refresh_token', nullable: true, select: false })
  refreshToken: string;

  @Column({ name: 'fcm_tokens', type: 'jsonb', default: [] })
  fcmTokens: string[];

  @Column({ name: 'subscription_plan', length: 50, nullable: true })
  subscriptionPlan: string;

  @Column({ name: 'subscription_expires_at', type: 'timestamp', nullable: true })
  subscriptionExpiresAt: Date;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId: string;

  @Column({ name: 'metadata', type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async validatePin(pin: string): Promise<boolean> {
    if (!this.pinHash) return false;
    return bcrypt.compare(pin, this.pinHash);
  }
}
