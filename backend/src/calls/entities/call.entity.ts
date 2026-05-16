import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum CallStatus {
  RINGING = 'ringing',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BUSY = 'busy',
  NO_ANSWER = 'no_answer',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

@Entity('calls')
@Index(['userId', 'startTime'])
@Index(['fromNumber', 'toNumber'])
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'call_sid', nullable: true })
  callSid: string;

  @Column({ name: 'from_number', length: 20 })
  fromNumber: string;

  @Column({ name: 'to_number', length: 20 })
  toNumber: string;

  @Column({
    type: 'enum',
    enum: CallDirection,
    default: CallDirection.OUTBOUND,
  })
  direction: CallDirection;

  @Column({
    type: 'enum',
    enum: CallStatus,
    default: CallStatus.RINGING,
  })
  status: CallStatus;

  @Column({ name: 'call_type', default: 'voice' })
  callType: string;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'answered_time', type: 'timestamp', nullable: true })
  answeredTime: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // seconds

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  cost: number;

  @Column({ name: 'on_hold', default: false })
  onHold: boolean;

  @Column({ name: 'recording_url', nullable: true })
  recordingUrl: string;

  @Column({ name: 'transferred_to', nullable: true })
  transferredTo: string;

  @Column({ name: 'caller_id_name', nullable: true })
  callerIdName: string;

  @Column({ name: 'target_user_id', nullable: true })
  targetUserId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
