import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum MessageStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  UNDELIVERED = 'undelivered',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

@Entity('messages')
@Index(['userId', 'createdAt'])
@Index(['fromNumber', 'toNumber'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'message_sid', nullable: true })
  messageSid: string;

  @Column({ name: 'from_number', length: 20 })
  fromNumber: string;

  @Column({ name: 'to_number', length: 20 })
  toNumber: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ name: 'media_urls', type: 'jsonb', default: [] })
  mediaUrls: string[];

  @Column({ type: 'enum', enum: MessageDirection, default: MessageDirection.OUTBOUND })
  direction: MessageDirection;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.QUEUED })
  status: MessageStatus;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  cost: number;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'received_at', type: 'timestamp', nullable: true })
  receivedAt: Date;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'error_code', nullable: true })
  errorCode: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ name: 'num_segments', default: 1 })
  numSegments: number;

  @Column({ name: 'conversation_id', nullable: true })
  conversationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
