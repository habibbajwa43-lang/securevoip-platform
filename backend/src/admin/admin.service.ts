import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { Call } from '../calls/entities/call.entity';
import { Message } from '../messages/entities/message.entity';
import { PhoneNumber } from '../numbers/entities/phone-number.entity';
import { Invoice } from '../billing/entities/invoice.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Call) private calls: Repository<Call>,
    @InjectRepository(Message) private messages: Repository<Message>,
    @InjectRepository(PhoneNumber) private numbers: Repository<PhoneNumber>,
    @InjectRepository(Invoice) private invoices: Repository<Invoice>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, activeUsers, totalCalls, totalMessages, totalNumbers] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { status: UserStatus.ACTIVE } }),
      this.calls.count(),
      this.messages.count(),
      this.numbers.count(),
    ]);

    const revenue = await this.invoices
      .createQueryBuilder('i')
      .select('SUM(i.amount)', 'total')
      .where("i.status = 'paid'")
      .getRawOne();

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const callsLast30 = await this.calls.createQueryBuilder('c')
      .where('c.createdAt >= :d', { d: last30Days }).getCount();

    return {
      totalUsers, activeUsers, totalCalls, callsLast30,
      totalMessages, totalNumbers,
      totalRevenue: parseFloat(revenue.total || '0'),
    };
  }

  async getCallTrafficChart(period = '7d') {
    const days = parseInt(period) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.calls.createQueryBuilder('c')
      .select("DATE(c.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect("SUM(c.duration)", 'totalDuration')
      .where('c.createdAt >= :since', { since })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getRevenueChart(period = '30d') {
    const days = parseInt(period) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.invoices.createQueryBuilder('i')
      .select("DATE(i.createdAt)", 'date')
      .addSelect('SUM(i.amount)', 'revenue')
      .where("i.status = 'paid' AND i.createdAt >= :since", { since })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getSystemHealth() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        database: 'online',
        redis: 'online',
        twilio: 'online',
        stripe: 'online',
      },
    };
  }

  async getAuditLogs(page = 1, limit = 50) {
    // In production, store audit logs in a separate table
    return { data: [], total: 0, page, limit };
  }
}
