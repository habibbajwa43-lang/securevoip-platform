import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Call } from '../calls/entities/call.entity';
import { Message } from '../messages/entities/message.entity';
import { PhoneNumber } from '../numbers/entities/phone-number.entity';
import { Invoice } from '../billing/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Call, Message, PhoneNumber, Invoice])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
