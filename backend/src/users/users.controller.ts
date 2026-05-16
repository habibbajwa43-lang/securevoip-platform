import { Controller, Get, Put, Delete, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update profile' })
  updateMe(@Request() req, @Body() dto: any) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Put('me/password')
  @ApiOperation({ summary: 'Change password' })
  changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Put('me/notifications')
  updateNotifications(@Request() req, @Body() prefs: Record<string, any>) {
    return this.usersService.updateNotificationPrefs(req.user.id, prefs);
  }

  @Put('me/dnd')
  updateDnd(@Request() req, @Body() schedule: Record<string, any>) {
    return this.usersService.updateDndSchedule(req.user.id, schedule);
  }

  // Admin routes
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('search') search: string) {
    return this.usersService.findAll(page, limit, search);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getStats() { return this.usersService.getStats(); }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updateRole(@Request() req, @Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(req.user.id, id, role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.usersService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  deleteUser(@Param('id') id: string) { return this.usersService.deleteUser(id); }
}
