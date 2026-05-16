import { Controller, Get, Post, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Req() req: any, @Query('number') number?: string) {
    return this.messagesService.getConversations(req.user.id, number);
  }

  @Get('conversations/:number')
  getConversation(@Req() req: any, @Param('number') number: string) {
    return this.messagesService.getConversationMessages(req.user.id, number);
  }

  @Post('send')
  sendMessage(@Req() req: any, @Body() body: any) {
    return this.messagesService.sendMessage({
      userId: req.user.id,
      fromNumber: body.fromNumber,
      toNumber: body.to,
      body: body.body,
      mediaUrls: body.mediaUrls,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });
  }

  @Get('analytics')
  getAnalytics(@Req() req: any, @Query('period') period: 'day' | 'week' | 'month' = 'week') {
    return this.messagesService.getMessageAnalytics(req.user.id, period);
  }

  @Post('webhooks/incoming')
  handleIncoming(@Body() body: any) {
    return this.messagesService.handleIncomingMessage(body);
  }

  @Post('webhooks/status')
  handleStatus(@Body() body: any) {
    return this.messagesService.handleStatusWebhook({
      MessageSid: body.MessageSid,
      MessageStatus: body.MessageStatus,
      ErrorCode: body.ErrorCode,
    });
  }
}