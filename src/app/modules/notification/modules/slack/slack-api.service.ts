import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import AppConfig from '@/config/app-config';
import { MessagePayloadInterface } from '@/app/modules/notification/modules/slack/interfaces/message-payload.interface';
import { RawAxiosRequestHeaders } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SlackApiService {
  private readonly apiUrl = AppConfig.slack.apiUrl;
  private readonly token = AppConfig.slack.token;
  private readonly headers: RawAxiosRequestHeaders = {
    Authorization: `Bearer ${this.token}`,
  };

  constructor(private readonly httpService: HttpService) {}

  getConversationsList() {
    const url = `${this.apiUrl}/conversations.list`;

    return firstValueFrom(this.httpService.get<unknown>(url, { headers: this.headers }));
  }

  sendChatMessage(payload: MessagePayloadInterface) {
    const url = `${this.apiUrl}/chat.postMessage`;

    return firstValueFrom(this.httpService.post<void>(url, payload, { headers: this.headers }));
  }
}
