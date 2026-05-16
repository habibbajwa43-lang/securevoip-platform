import { Controller, Get, Post, Body, Query, UseGuards, Request, RawBodyRequest, Req, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Billing')
@Controller({ path: 'billing', version: '1' })
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('wallet')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getWallet(@Request() req) { return this.billingService.getWalletInfo(req.user.id); }

  @Get('invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getInvoices(@Request() req, @Query('page') page = 1) {
    return this.billingService.getUserInvoices(req.user.id, page);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getTransactions(@Request() req, @Query('page') page = 1) {
    return this.billingService.getUserTransactions(req.user.id, page);
  }

  @Get('usage')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getUsage(@Request() req, @Query('period') period = '30d') {
    return this.billingService.getUsageSummary(req.user.id);
  }

  @Post('payment-intent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createPaymentIntent(@Request() req, @Body() body: { amount: number; currency?: string }) {
    return this.billingService.createPaymentIntent(req.user.id, body.amount, body.currency);
  }

  @Post('webhooks/stripe')
  handleStripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.billingService.handleStripeWebhook(req.rawBody as Buffer, sig);
  }

  @Get('admin/invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAllInvoices(@Query('page') page = 1) { return this.billingService.getAllInvoices(page); }
}
