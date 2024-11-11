import {
  TelegramNotificationReceiver
} from '@/app/modules/notification/modules/telegram/entities/telegram-notification-receiver.entity';
import { Repository } from 'typeorm';
import AppConfig from '@/config/app-config';
import { InjectRepository } from '@nestjs/typeorm';
import {I18nService} from 'nestjs-i18n';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import NodeTelegramBotApi, { Message, PreCheckoutQuery} from 'node-telegram-bot-api';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import {
  TelegramNotificationSubscribeCallbackUrlSuccessPayloadDto
} from '@/app/modules/notification/modules/telegram/dto/callback-urls/telegram-notification-subscribe-callback-url-success-payload.dto';
import {setLanguage} from '@/app/utils/localization';
import {Language} from '@/app/enum/language.enum';

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
    if (message?.text?.startsWith ('/start')) {
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
  private async onDeleteMessage(message: PreCheckoutQuery) {
    console.log(message);
    this.logger.debug('A user left the chat');
  }


  private async onStart (message: Message & { query: string }) {

    try {
      const [userUuid, language] = message.query.split ('---');
      const chatId =  String(message.from.id);
      const subscriberUuid = userUuid.trim ();
      // const subscriberName = [message.from.first_name, message.from.last_name].join (' ')?.trim () || message.from.username?.trim ();
      const subscriberUsername = message.from.username?.trim ();

      const subscriberLanguage = setLanguage(language as Language);
      const startSubscription = this.i18n.t ('telegram.bot.start.start_subscription', {
        lang: subscriberLanguage,
      });
      await this.sendMessage(message.from.id, startSubscription);
      const existingSubscriber = await this.existingSubscriber(subscriberUuid);

      if (!existingSubscriber) {
        const notSubscribedMessage = this.i18n.t ('telegram.bot.start.not_subscribed', {
          lang: subscriberLanguage,
        });
        await this.sendMessage(message.from.id, notSubscribedMessage);

        return;
      }

      if (existingSubscriber.receiver_uuid === subscriberUuid && existingSubscriber.chat_id === chatId) {
        const alreadySubscribed = this.i18n.t ('telegram.bot.start.already_subscribed', {
          lang: subscriberLanguage,
        });
        await this.sendMessage (message.from.id, alreadySubscribed);

        return;
      }

      if(existingSubscriber.callback_url_subscribed_success){
        const callbackSuccessResponse: any = await this.sendWebhookOnSuccessfullySubscribed(
          subscriberUuid,
          subscriberUsername,
          existingSubscriber.callback_url_subscribed_success
        );

        if(callbackSuccessResponse?.subscriber_uuid !== subscriberUuid) {
          const malformedCallbackUrl = this.i18n.t ('telegram.bot.start.malformed_callback_url', {
            lang: subscriberLanguage,
          });
          await this.sendMessage (message.from.id, malformedCallbackUrl);

          return;
        }
      }

      const subscriptionFinished = await this.finishSubscription(subscriberUuid, chatId);

      if(!subscriptionFinished) {
        const cannotSubscription = this.i18n.t ('telegram.bot.start.cannot_subscription', {
          lang: subscriberLanguage,
        });
        await this.sendMessage (message.from.id, cannotSubscription);
      }

      const subscriptionFinishedMessage = this.i18n.t ('telegram.bot.start.subscription_finished', {
        lang: subscriberLanguage,
      });
      await this.sendMessage(message.from.id, subscriptionFinishedMessage);
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

  private async finishSubscription (subscriberUuid: string, chatId: string) {
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
