import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NumbersModule } from './numbers/numbers.module';
import { CallsModule } from './calls/calls.module';
import { MessagesModule } from './messages/messages.module';
import { BillingModule } from './billing/billing.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseModule } from './database/database.module';
import { configValidationSchema } from './config/config.schema';
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: configValidationSchema,
    }),
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
    }),
    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('RATE_LIMIT_TTL', 60) * 1000,
          limit: configService.get('RATE_LIMIT_MAX', 100),
        },
      ],
    }),
    // Scheduling
    ScheduleModule.forRoot(),
    // Event Emitter
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
    // Feature Modules
    DatabaseModule,
    AuthModule,
    UsersModule,
    NumbersModule,
    CallsModule,
    MessagesModule,
    BillingModule,
    AdminModule,
    NotificationsModule,
  ],
})
export class AppModule {}