import { Module } from '@nestjs/common';
import { TelegramNotificationEventsService } from './services/telegram-notification-events.service';

import {
  TelegramNotificationService
} from '@/app/modules/notification/modules/telegram/services/telegram-notification.service';
import NodeTelegramBotApi from 'node-telegram-bot-api';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TelegramNotificationReceiver
} from '@/app/modules/notification/modules/telegram/entities/telegram-notification-receiver.entity';
import {
  TelegramNotification
} from '@/app/modules/notification/modules/telegram/entities/telegram-notification.entity';
import {
  TelegramNotificationController
} from '@/app/modules/notification/modules/telegram/telegram-notification.controller';
import { HttpModule } from '@nestjs/axios';

@Module ({
  imports: [
    TypeOrmModule.forFeature ([TelegramNotification, TelegramNotificationReceiver]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    })
  ],
  exports: [TypeOrmModule, TelegramNotificationService],
  controllers: [TelegramNotificationController],
  providers: [TelegramNotificationEventsService, TelegramNotificationService, NodeTelegramBotApi],
})
export class TelegramNotificationModule {
}
