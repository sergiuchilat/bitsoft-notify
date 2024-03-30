import { Module } from '@nestjs/common';

import { DiscordNotificationController } from './discord-notification.controller';
import { DiscordNotificationService } from './discord-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordNotification } from '@/app/modules/notification/modules/discord/entities/discord-notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiscordNotification])],
  controllers: [DiscordNotificationController],
  providers: [DiscordNotificationService],
})
export class DiscordNotificationModule {}
