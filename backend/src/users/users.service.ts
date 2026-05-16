import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const qb = this.usersRepository.createQueryBuilder('user');
    if (search) {
      qb.where('user.email ILIKE :s OR user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.phoneNumber ILIKE :s', { s: `%${search}%` });
    }
    const [data, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async updateProfile(userId: string, dto: Partial<User>): Promise<User> {
    const user = await this.findOne(userId);
    const allowed = ['firstName', 'lastName', 'avatarUrl', 'timezone', 'language'];
    allowed.forEach(k => { if (dto[k] !== undefined) user[k] = dto[k]; });
    return this.usersRepository.save(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, select: ['id', 'password'] });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new ForbiddenException('Current password is incorrect');
    user.password = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.save(user);
  }

  async updateNotificationPrefs(userId: string, prefs: Record<string, any>): Promise<User> {
    const user = await this.findOne(userId);
    user.notificationPrefs = { ...user.notificationPrefs, ...prefs };
    return this.usersRepository.save(user);
  }

  async updateDndSchedule(userId: string, schedule: Record<string, any>): Promise<User> {
    const user = await this.findOne(userId);
    user.dndSchedule = schedule as any;
    return this.usersRepository.save(user);
  }

  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.findOne(userId);
    user.status = status;
    return this.usersRepository.save(user);
  }

  async updateRole(adminId: string, targetId: string, role: UserRole): Promise<User> {
    if (adminId === targetId) throw new ForbiddenException('Cannot change your own role');
    const user = await this.findOne(targetId);
    user.role = role;
    return this.usersRepository.save(user);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.findOne(userId);
    await this.usersRepository.softDelete(userId);
  }

  async getStats() {
    const total = await this.usersRepository.count();
    const active = await this.usersRepository.count({ where: { status: UserStatus.ACTIVE } });
    const admins = await this.usersRepository.count({ where: { role: UserRole.ADMIN } });
    const today = new Date(); today.setHours(0,0,0,0);
    const newToday = await this.usersRepository.createQueryBuilder('u')
      .where('u.createdAt >= :today', { today }).getCount();
    return { total, active, admins, newToday };
  }
}

