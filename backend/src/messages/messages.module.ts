import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { PhoneNumber } from '../numbers/entities/phone-number.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User, PhoneNumber])],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
