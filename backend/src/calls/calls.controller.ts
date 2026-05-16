import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { CallsService } from './calls.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  getUserCalls(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 20, @Query('direction') direction?: any, @Query('status') status?: any) {
    return this.callsService.getUserCalls(req.user.id, { page: +page, limit: +limit, direction, status });
  }

  @Get('analytics')
  getAnalytics(@Req() req: any, @Query('period') period: any = 'week') {
    return this.callsService.getCallAnalytics(req.user.id, period);
  }

  @Post('initiate')
  initiateCall(@Req() req: any, @Body() body: any) {
    return this.callsService.initiateCall({
      userId: req.user.id,
      fromNumber: body.fromNumber,
      toNumber: body.to,
      callType: body.callType || 'voice',
    });
  }

  @Post('twiml/incoming')
  handleIncoming(@Body() body: any) {
    return this.callsService.handleIncomingCall({
      callSid: body.CallSid,
      from: body.From,
      to: body.To,
      callStatus: body.CallStatus,
    });
  }

  @Post('twiml/status')
  updateStatus(@Body() body: any) {
    return this.callsService.updateCallStatus(body.CallSid, body.CallStatus);
  }

  @Patch(':id/end')
  endCall(@Param('id') id: string, @Req() req: any) {
    return this.callsService.endCall(id, req.user.id);
  }

  @Patch(':id/transfer')
  transferCall(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.callsService.transferCall(id, body.to, req.user.id);
  }
}