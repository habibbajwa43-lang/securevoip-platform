import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { NumbersService } from './numbers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('numbers')
@UseGuards(JwtAuthGuard)
export class NumbersController {
  constructor(private readonly numbersService: NumbersService) {}

  @Get()
  getUserNumbers(@Req() req: any) {
    return this.numbersService.getUserNumbers(req.user.id);
  }

  @Get('search')
  search(@Query('country') countryCode: string, @Query('type') numberType: any, @Query('areaCode') areaCode: string, @Query('contains') contains: string) {
    return this.numbersService.searchAvailableNumbers({ countryCode, numberType, areaCode, contains });
  }

  @Post('purchase')
  purchase(@Req() req: any, @Body() body: any) {
    return this.numbersService.purchaseNumber(req.user.id, body.phoneNumber);
  }

  @Put(':id/routing')
  updateRouting(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.numbersService.updateRoutingRules(req.user.id, id, body);
  }

  @Put(':id/caller-id')
  updateCallerId(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.numbersService.updateCallerId(req.user.id, id, body.callerIdName);
  }

  @Put(':id/default')
  setDefault(@Param('id') id: string, @Req() req: any) {
    return this.numbersService.setDefaultNumber(req.user.id, id);
  }

  @Delete(':id/release')
  release(@Param('id') id: string, @Req() req: any) {
    return this.numbersService.releaseNumber(req.user.id, id);
  }

  @Post('port')
  portNumber(@Req() req: any, @Body() body: any) {
    return this.numbersService.portNumberIn(req.user.id, body);
  }
}