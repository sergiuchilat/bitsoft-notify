import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { TelegramNotificationCreatePayloadDto } from '@/app/modules/notification/modules/telegram/dto/telegram-notification-create-payload.dto';
import AppConfig from '@/config/app-config';
import { DataSource, IsNull, LessThan, Repository } from 'typeorm';
import { TelegramNotificationReceiver } from '@/app/modules/notification/modules/telegram/entities/telegram-notification-receiver.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramNotification } from '@/app/modules/notification/modules/telegram/entities/telegram-notification.entity';
import { TelegramNotificationCreateResponseDto } from '@/app/modules/notification/modules/telegram/dto/telegram-notification-create-response.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Language } from '@/app/enum/language.enum';
import { plainToInstance } from 'class-transformer';
import NodeTelegramBotApi from 'node-telegram-bot-api';
import {
  TelegramSubscriberCreatePayloadDto
} from '@/app/modules/notification/modules/telegram/dto/telegram-subscriber-create-payload.dto';
import {
  TelegramGroupNotificationCreatePayloadDto
} from '@/app/modules/notification/modules/telegram/dto/telegram-group-notification-create-payload.dto';

@Injectable()
export class TelegramNotificationService {
  constructor(
    @InjectRepository(TelegramNotificationReceiver)
    private readonly telegramReceiverRepository: Repository<TelegramNotificationReceiver>,
    @InjectRepository(TelegramNotification)
    private readonly telegramNotificationRepository: Repository<TelegramNotification>,
    private readonly dateSource: DataSource,
  ) {}

  async subscribe(subscriber: TelegramSubscriberCreatePayloadDto) {
    const existingSubscriber = await this.telegramReceiverRepository.findOne({
      where: {
        receiver_uuid: subscriber.subscriber_uuid,
      },
    });
    if (existingSubscriber) {
      await this.telegramReceiverRepository.update(existingSubscriber.id, {
        created_at: new Date(),
        language: subscriber.language,
        callback_url_subscribed_success: subscriber.callback_urls.subscribed_success,
        callback_url_subscribed_error: subscriber.callback_urls.subscribed_error,
        callback_url_unsubscribe: subscriber.callback_urls.unsubscribe,
      });
      return await this.telegramReceiverRepository.findOne({
        where: {
          receiver_uuid: subscriber.subscriber_uuid,
        },
      });
    }
    try {
      const subscriberEntity = new TelegramNotificationReceiver();
      subscriberEntity.language = subscriber.language;
      subscriberEntity.receiver_uuid = subscriber.subscriber_uuid;
      subscriberEntity.callback_url_subscribed_success = subscriber.callback_urls.subscribed_success;
      subscriberEntity.callback_url_subscribed_error = subscriber.callback_urls.subscribed_error;
      subscriberEntity.callback_url_unsubscribe = subscriber.callback_urls.unsubscribe;

      return {
        ...await this.telegramReceiverRepository.save(subscriberEntity),
        'bot_name': AppConfig.telegram.botName,
        'subscribe_start_url': this.createSubScribeStartUrl(subscriber.subscriber_uuid, subscriber.language),
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async unsubscribe(receiver_uuid: string) {
    return await this.telegramReceiverRepository.delete({
      receiver_uuid,
    });
  }

  async getSubscribers() {
    return await this.telegramReceiverRepository.find();
  }

  async isSubscribed(receiver_uuid: string) {
    return await this.telegramReceiverRepository.findOne({
      where: {
        receiver_uuid,
      },
    });
  }

  async createNotification(
    notification: TelegramNotificationCreatePayloadDto,
  ): Promise<TelegramNotificationCreateResponseDto[]> {
    const createdNotifications = [];
    const queryRunner = this.dateSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const receiver of notification.receivers) {
        const receiverMatch = await this.getChatIdByReceiverUuid(receiver);

        if (!receiverMatch) {
          continue;
        }

        const newNotification = new TelegramNotification();
        newNotification.receiver_id = receiverMatch.id;
        newNotification.subject = notification.subject;
        newNotification.body = notification.body;
        newNotification.language = receiverMatch.language;
        newNotification.retry_attempts = 1;

        const response = await this.sendPushNotification(receiverMatch.chat_id, newNotification);
        if (response && response.message_id) {
          newNotification.sent_at = new Date();
        }

        const createdNotification = await queryRunner.manager.save(newNotification);
        createdNotifications.push(
          plainToInstance(TelegramNotificationCreateResponseDto, createdNotification),
        );
        await this.updateReceiverLanguage(receiverMatch.id, notification.language);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log('Error', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    console.log('N:', createdNotifications);

    if (!createdNotifications.length) {
      throw new NotFoundException({
        code: 'NO_RECEIVERS_FOUND',
      });
    }

    return createdNotifications;
  }

  private async updateReceiverLanguage(receiverId: number, language: Language) {
    await this.telegramReceiverRepository.update(receiverId, {
      language,
    });
  }

  private async getChatIdByReceiverUuid(uuid: string) {
    return await this.telegramReceiverRepository.findOne({
      where: {
        receiver_uuid: uuid,
      },
    });
  }

  private async sendPushNotification(chatId: number, notification: TelegramNotification) {
    console.log('Sending notification', notification);
    const bot = new NodeTelegramBotApi(AppConfig.telegram.botToken);
    console.log('Bot', bot);
    const message = `<strong>${notification.subject}</strong>\n${notification.body}`;
    try {
      return await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (e) {
      console.log('Error', e);
      throw new HttpException({
        error: 'Error while sending notification',
      }, 500);

    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteOldSentNotifications() {
    const days = 7;
    await this.telegramNotificationRepository.delete({
      sent_at: LessThan(new Date(new Date().setDate(new Date().getDate() - days))),
    });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async deleteOldUnsentNotifications() {
    const days = 30;
    await this.telegramNotificationRepository.delete({
      sent_at: IsNull(),
      created_at: LessThan(new Date(new Date().setDate(new Date().getDate() - days))),
    });
  }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  async deleteOldUnconfirmedSubscribers() {
    const minutes = 5;
    await this.telegramReceiverRepository.delete({
      confirmed_at: IsNull(),
      created_at: LessThan(new Date(new Date().getTime() - minutes * 60000)),
    });
  }

  public createSubScribeStartUrl(subscriberId: string, language: Language) {
    return `https://t.me/${AppConfig.telegram.botName}?start=${subscriberId}---${language}`;
  }

  async createGroupNotification(notificationCreatePayloadDto: TelegramGroupNotificationCreatePayloadDto) {

    try {
      const bot = new NodeTelegramBotApi(AppConfig.telegram.botToken);
      //console.log('Bot', bot);
      const message = `<strong>${notificationCreatePayloadDto.subject}</strong>\n${notificationCreatePayloadDto.body}`;
      for(const chatId of notificationCreatePayloadDto.receivers){
        console.log('ChatId', chatId);
        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      }
      return {
        subject: notificationCreatePayloadDto.subject,
      };
    } catch (e) {
      if(e?.response?.statusCode >= 400 && e?.response?.statusCode < 500) {
        throw new HttpException({
          error_message: 'Invalid chat id or bot is not in the group',
          error_code: 'INVALID_CHAT_ID',
        }, 400);
      }
      throw new HttpException({
        error_message: 'Error while sending notification',
        error_code: 'SENDING_ERROR',
      }, 500);

    }
  }
}
