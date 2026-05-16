import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum InvoiceStatus {
  DRAFT = 'draft', PENDING = 'pending', PAID = 'paid',
  FAILED = 'failed', REFUNDED = 'refunded', VOIDED = 'voided',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'invoice_number', unique: true, nullable: true }) invoiceNumber: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) amount: number;
  @Column({ default: 'USD' }) currency: string;
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING }) status: InvoiceStatus;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'payment_method', nullable: true }) paymentMethod: string;
  @Column({ name: 'stripe_payment_intent_id', nullable: true }) stripePaymentIntentId: string;
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true }) paidAt: Date;
  @Column({ type: 'jsonb', nullable: true }) items: any[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}