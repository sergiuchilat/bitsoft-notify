import { Injectable, Logger } from '@nestjs/common';
import { SendMessageDto } from '@/app/modules/notification/modules/whatsapp/dto/send-message.dto';
import { SlackApiService } from '@/app/modules/notification/modules/slack/slack-api.service';
import { Repository } from 'typeorm';
import { SlackNotificationEntity } from '@/app/modules/notification/modules/slack/entities/slack-notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappNotificationEntity } from '@/app/modules/notification/modules/whatsapp/entities/whatsapp-notification.entity';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(
    @InjectRepository(SlackNotificationEntity)
    private readonly slackNotificationRepository: Repository<SlackNotificationEntity>,
    private readonly slackApiService: SlackApiService,
  ) {}

  async getConversationsList() {
    const response = await this.slackApiService.getConversationsList();

    return response.data;
  }

  async sendMessage(payload: SendMessageDto) {
    const entities = await this.createNotifications(payload);
    await this.sendNotifications(entities);
  }

  private async createNotifications(payload: SendMessageDto) {
    const entities = payload.receivers.map(
      (receiverId): SlackNotificationEntity => ({
        body: payload.body,
        subject: payload.subject,
        receiver_id: receiverId,
      }),
    );

    await this.slackNotificationRepository.insert(entities);

    return entities;
  }

  private async sendNotifications(entities: WhatsappNotificationEntity[]) {
    for (const entity of entities) {
      const message = this.composeMessage(entity);

      try {
        await this.slackApiService.sendChatMessage({
          channel: entity.receiver_id,
          text: message,
        });
      } catch (err) {
        this.logger.error(`Cannot notify: ${err.message}`);
        continue;
      }

      await this.slackNotificationRepository.update({ id: entity.id }, { sent_at: new Date() });
    }
  }

  private composeMessage(payload: { body: string; subject: string }) {
    return `*${payload.subject}*\n${payload.body}`;
  }
}
