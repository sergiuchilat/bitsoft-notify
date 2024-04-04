import {
  TelegramNotificationReceiver
} from '@/app/modules/notification/modules/telegram/entities/telegram-notification-receiver.entity';
import { Repository } from 'typeorm';
import AppConfig from '@/config/app-config';
//import { setLanguage } from '@/app/utils/localization';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
//import { Language } from '@/app/enum/language.enum';
import NodeTelegramBotApi, { Message } from 'node-telegram-bot-api';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import {
  TelegramNotificationSubscribeCallbackUrlSuccessPayloadDto
} from '@/app/modules/notification/modules/telegram/dto/callback-urls/telegram-notification-subscribe-callback-url-success-payload.dto';

@Injectable ()
export class TelegramNotificationEventsService extends NodeTelegramBotApi implements OnModuleInit {
  private readonly logger = new Logger (TelegramNotificationEventsService.name, { timestamp: true });

  constructor (
    @InjectRepository (TelegramNotificationReceiver)
    private readonly telegramReceiverRepository: Repository<TelegramNotificationReceiver>,
    private readonly i18n: I18nService,
    private readonly httpService: HttpService,
  ) {
    super (AppConfig.telegram.botToken, { polling: true });
  }

  onModuleInit (): void {
    this.on ('message', this.onMessage);
    this.on ('polling_error', this.handlePollingError);
  }

  private async onMessage (message: Message) {
    if (message.text.startsWith ('/start')) {
      const param = message.text.replace ('/start', '');

      return this.onStart ({ ...message, query: param });
    }

    const replyMessage = this.i18n.t ('telegram.bot.on_message.no_messages_accepted', {
      lang: 'en',
    });

    await this.sendMessage (message.from.id, replyMessage, {
      parse_mode: 'HTML',
    });
  }

  private async onStart (message: Message & { query: string }) {


    try {
      const [userUuid, language] = message.query.split ('---');
      console.log ('language', language);
      const chatId = Number (message.from.id);
      const subscriberUuid = userUuid.trim ();
      //const botName = AppConfig.telegram.botName;
      const subscriberName = [message.from.first_name, message.from.last_name].join (' ').trim () || message.from.username.trim ();

      await this.sendMessage (message.from.id, `Hello ${subscriberName}! Starting subscription...`);

      //const subscriberLanguage = setLanguage (language as Language);
      const existingSubscriber = await this.existingSubscriber (subscriberUuid);

      if (!existingSubscriber) {
        await this.sendMessage (message.from.id, 'Subscription was not started. Please start subscription on your APP or contact administrator. END');

        return;
      }

      if (existingSubscriber.receiver_uuid === subscriberUuid && existingSubscriber.chat_id === chatId) {
        await this.sendMessage (message.from.id, 'Already subscribed. END');

        return;
      }

      if(existingSubscriber.callback_url_subscribed_success){
        const callbackSuccessResponse: any = await this.sendWebhookOnSuccessfullySubscribed(
          subscriberUuid,
          subscriberName,
          existingSubscriber.callback_url_subscribed_success
        );

        console.log('callbackSuccessResponse', callbackSuccessResponse);

        if(callbackSuccessResponse?.subscriber_uuid !== subscriberUuid) {
          await this.sendMessage (message.from.id, 'Error. Your APP callback URL is malformed. END');

          return;
        }
      }

      const subscriptionFinished = await this.finishSubscription (subscriberUuid, chatId);

      if(!subscriptionFinished) {
        await this.sendMessage (message.from.id, 'Error! Cannot finish subscription. END');
      }

      await this.sendMessage (message.from.id, 'Subscription finished');

    } catch (e) {
      console.error (e);
      const messageText = this.i18n.t ('telegram.bot.start.error') + JSON.stringify (e);
      await this.sendMessage (message.from.id, messageText, {
        parse_mode: 'HTML',
      });
    }
  }

  private handlePollingError ({ response }: any) {
    this.logger.error (`Error during polling! ${ response?.body?.error_code } ${ response?.body?.description }`);
  }

  private async sendWebhookOnSuccessfullySubscribed (
    subscriberUuid: string,
    subscriberUsername: string,
    callback_url_subscribed_success: string
  ): Promise<AxiosResponse> {
    const payload: TelegramNotificationSubscribeCallbackUrlSuccessPayloadDto = {
      subscriber_uuid: subscriberUuid,
      telegram_username: subscriberUsername,
      bot_name: AppConfig.telegram.botName
    };

    console.log('KEY', AppConfig.app.security.write_access_key);

    return this.httpService.axiosRef.post (callback_url_subscribed_success, payload, {
      headers: {
        'x-api-key': AppConfig.app.security.write_access_key
      },

    })
      .then (response => {
        console.log ('response', response.data);
        return response.data;
      })
      .catch (error => {
        console.error ('error', error);
        return error;
      });
  }

  private async finishSubscription (subscriberUuid: string, chatId: number) {
    const response = await this.telegramReceiverRepository.update (
      {
        // id: parseInt(id),
        receiver_uuid: subscriberUuid,
      },
      {
        chat_id: chatId,
        confirmed_at: new Date (),
      },
    );

    return response.affected > 0;
  }

  private async existingSubscriber (subscriberUuid: string) {

    return await this.telegramReceiverRepository.findOne ({
      where: [
        {
          receiver_uuid: subscriberUuid,
        },
      ],
    });
  }
}
