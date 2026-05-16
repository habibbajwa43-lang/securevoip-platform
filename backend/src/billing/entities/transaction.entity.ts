import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  REFUND = 'refund',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ type: 'enum', enum: TransactionType }) type: TransactionType;
  @Column({ type: 'decimal', precision: 10, scale: 4 }) amount: number;
  @Column({ default: 'USD' }) currency: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) reference: string;
  @Column({ name: 'related_id', nullable: true }) relatedId: string;
  @Column({ name: 'related_type', nullable: true }) relatedType: string;
  @Column({ default: 'pending' }) status: string;
  @Column({ name: 'balance_before', type: 'decimal', precision: 10, scale: 4, nullable: true }) balanceBefore: number;
  @Column({ name: 'balance_after', type: 'decimal', precision: 10, scale: 4, nullable: true }) balanceAfter: number;
  @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, any>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}