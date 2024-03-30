import { Injectable } from '@nestjs/common';
import * as Discord from 'discord.js';
import { DiscordNotificationCreatePayloadDto } from '@/app/modules/notification/modules/discord/dto/discord-notification-create-payload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscordNotification } from '@/app/modules/notification/modules/discord/entities/discord-notification.entity';
import { IsNull, LessThan, Repository } from 'typeorm';
import { Language } from '@/app/enum/language.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DiscordNotificationService {
  constructor(
    @InjectRepository(DiscordNotification)
    private readonly discordNotificationRepository: Repository<DiscordNotification>,
  ) {}

  async sendNotification(notification: DiscordNotificationCreatePayloadDto, language: Language) {
    try {
      for (const notificationReceiverChannel of notification.receivers) {
        const createdNotification = await this.discordNotificationRepository.save({
          receiver_channel: notificationReceiverChannel,
          subject: notification.subject,
          body: notification.body,
          sender: notification.sender,
          language,
        });

        const client = new Discord.WebhookClient({
          url: `https://discord.com/api/webhooks/${notificationReceiverChannel}`,
        });

        const response = await client.send({
          embeds: [
            {
              title: notification.subject,
              fields: [
                { name: 'Sender', value: notification.sender },
                { name: 'Message', value: notification.body },
              ],
            },
          ],
        });

        if (response.id) {
          await this.discordNotificationRepository.update(
            {
              id: createdNotification.id,
            },
            {
              sent_at: new Date(),
            },
          );
        }
        console.log('Sent', response);
      }
    } catch (e) {
      console.log('Error');
      console.log(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  deleteOldNotifications() {
    const days = 7;
    return this.discordNotificationRepository.delete({
      sent_at: LessThan(new Date(new Date().setDate(new Date().getDate() - days))),
    });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async deleteOldUnsentNotifications() {
    const days = 30;
    await this.discordNotificationRepository.delete({
      sent_at: IsNull(),
      created_at: LessThan(new Date(new Date().setDate(new Date().getDate() - days))),
    });
  }
}
