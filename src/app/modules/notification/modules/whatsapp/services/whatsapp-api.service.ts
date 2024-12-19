import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { MessageReplyWebhookDto } from '@/app/modules/notification/modules/whatsapp/dto/message-reply-webhook.dto';
import { RawAxiosRequestHeaders } from 'axios';
import AppConfig from '@/config/app-config';
import { catchError, of } from 'rxjs';

@Injectable()
export class WhatsappApiService {
  private readonly logger = new Logger(WhatsappApiService.name);

  private readonly headers: RawAxiosRequestHeaders = {
    'x-api-key': AppConfig.api.key,
  };

  constructor(private readonly httpService: HttpService) {}

  messageReplyWebhook(payload: MessageReplyWebhookDto) {
    const url = `${AppConfig.api.url}/webhooks/whatsapp/message`;

    return this.httpService.post(url, payload, { headers: this.headers }).pipe(
      catchError((err) => {
        this.logger.error(err.message);

        return of(null);
      }),
    );
  }
}
