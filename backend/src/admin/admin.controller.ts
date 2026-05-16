import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() { return this.adminService.getDashboardStats(); }

  @Get('charts/calls')
  getCallChart(@Query('period') period = '7d') { return this.adminService.getCallTrafficChart(period); }

  @Get('charts/revenue')
  getRevenueChart(@Query('period') period = '30d') { return this.adminService.getRevenueChart(period); }

  @Get('health')
  getHealth() { return this.adminService.getSystemHealth(); }

  @Get('audit-logs')
  getAuditLogs(@Query('page') page = 1) { return this.adminService.getAuditLogs(page); }
}
