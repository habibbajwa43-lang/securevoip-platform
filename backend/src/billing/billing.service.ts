import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: any;

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-08-16' as any,
    });
  }

  // ─── Add Wallet Funds ───────────────────────────────────────────────────────
  async createPaymentIntent(userId: string, amount: number, currency = 'usd') {
    if (amount < 5) throw new BadRequestException('Minimum top-up is $5');
    if (amount > 1000) throw new BadRequestException('Maximum top-up is $1000 per transaction');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Ensure Stripe customer exists
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await this.userRepository.update(userId, { stripeCustomerId });
    }

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      customer: stripeCustomerId,
      metadata: { userId, type: 'wallet_topup' },
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
    };
  }

  // ─── Stripe Webhook ─────────────────────────────────────────────────────────
  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (error) {
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { userId, type } = paymentIntent.metadata;
    if (!userId) return;

    const amount = paymentIntent.amount / 100;

    // Add to wallet
    await this.userRepository.increment({ id: userId }, 'walletBalance', amount);

    // Create transaction record
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.CREDIT,
      amount,
      description: 'Wallet top-up via Stripe',
      reference: paymentIntent.id,
      status: 'completed',
    });
    await this.transactionRepository.save(transaction);

    // Create invoice
    const invoice = this.invoiceRepository.create({
      userId,
      amount,
      status: InvoiceStatus.PAID,
      description: 'Wallet Top-up',
      paymentMethod: 'stripe',
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
    });
    await this.invoiceRepository.save(invoice);

    this.logger.log(`💰 Payment success: $${amount} for user ${userId}`);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { userId } = paymentIntent.metadata;
    if (!userId) return;

    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.CREDIT,
      amount: paymentIntent.amount / 100,
      description: 'Failed wallet top-up',
      reference: paymentIntent.id,
      status: 'failed',
    });
    await this.transactionRepository.save(transaction);

    this.logger.warn(`❌ Payment failed for user ${userId}`);
  }

  private async handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (userId) {
      await this.userRepository.update(userId, { subscriptionPlan: null });
    }
  }

  // ─── Get Wallet Balance ─────────────────────────────────────────────────────
  async getWalletInfo(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'walletBalance', 'currency'],
    });

    if (!user) throw new NotFoundException('User not found');

    const recentTransactions = await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      balance: user.walletBalance,
      currency: user.currency,
      recentTransactions,
    };
  }

  // ─── Get Invoices ───────────────────────────────────────────────────────────
  async getUserInvoices(userId: string, page = 1, limit = 20) {
    const [invoices, total] = await this.invoiceRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      invoices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ─── Get Transactions ───────────────────────────────────────────────────────
  async getUserTransactions(userId: string, page = 1, limit = 20) {
    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ─── Usage Summary ──────────────────────────────────────────────────────────
  async getUsageSummary(userId: string) {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const transactions = await this.transactionRepository.find({
      where: { userId },
    });

    const thisMonthDebits = transactions
      .filter(t => t.type === TransactionType.DEBIT && t.createdAt >= thisMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalSpent = transactions
      .filter(t => t.type === TransactionType.DEBIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      thisMonthSpend: parseFloat(thisMonthDebits.toFixed(4)),
      totalSpend: parseFloat(totalSpent.toFixed(4)),
    };
  }

  // ─── Admin: Get All Invoices ────────────────────────────────────────────────
  async getAllInvoices(page = 1, limit = 50) {
    const [invoices, total] = await this.invoiceRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    return {
      invoices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}



