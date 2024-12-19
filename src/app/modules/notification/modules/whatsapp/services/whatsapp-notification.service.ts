import { HttpException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import { SendMessageDto } from '@/app/modules/notification/modules/whatsapp/dto/send-message.dto.js';
import { HttpStatusCode } from 'axios';
import { Repository } from 'typeorm';
import { WhatsappNotificationEntity } from '@/app/modules/notification/modules/whatsapp/entities/whatsapp-notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import qrcode from 'qrcode';
import { SendPersonalMessageDto } from '@/app/modules/notification/modules/whatsapp/dto/sent-personal-message.dto';
import { WhatsappApiService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-api.service';
import { MessageReplyWebhookDto } from '@/app/modules/notification/modules/whatsapp/dto/message-reply-webhook.dto';

@Injectable()
export class WhatsappNotificationService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappNotificationService.name);

  private readonly client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  constructor(
    @InjectRepository(WhatsappNotificationEntity)
    private readonly whatsappNotificationRepository: Repository<WhatsappNotificationEntity>,
    private readonly whatsappApiService: WhatsappApiService,
  ) {}

  onModuleInit() {
    this.watchMessages();
    this.watchQrCode();
    this.watchReady();

    this.client
      .initialize()
      .then(() => {
        this.logger.log('WhatsApp client was initialised');
      })
      .catch((err) => {
        this.logger.error(`Cannot initialize WhatsApp client: ${err.message}`);
      });
  }

  async sendMessage(payload: SendMessageDto) {
    const notifications = await this.createNotifications(payload);
    return this.sendNotifications(notifications);
  }

  sendPersonalMessage(payload: SendPersonalMessageDto) {
    const receiverIds = payload.receivers.map(this.phoneNumberToReceiverId);

    return this.sendMessage({ ...payload, receivers: receiverIds });
  }

  getChatsList() {
    return this.client.getChats();
  }

  initializeClient() {
    return this.client.initialize();
  }

  async destroyClient() {
    try {
      await this.client.destroy();
    } catch (err) {
      this.logger.error(`Cannot destroy the client: ${err.message}`);
      throw new HttpException(err.message, HttpStatusCode.InternalServerError);
    }
  }

  private phoneNumberToReceiverId(phoneNumber: string) {
    return phoneNumber.slice(1).concat('@c.us');
  }

  private async createNotifications(payload: SendMessageDto) {
    const entities = payload.receivers.map(
      (receiverId): WhatsappNotificationEntity => ({
        body: payload.body,
        subject: payload.subject,
        receiver_id: receiverId,
      }),
    );

    await this.whatsappNotificationRepository.insert(entities);

    return entities;
  }

  private async sendNotifications(entities: WhatsappNotificationEntity[]) {
    const responses: Message[] = [];

    for (const entity of entities) {
      const message = this.getMessageText(entity);

      try {
        const response = await this.client.sendMessage(entity.receiver_id, message);
        responses.push(response);
      } catch (err) {
        this.logger.error(`Cannot notify: ${err.message}`);
        continue;
      }

      await this.whatsappNotificationRepository.update({ id: entity.id }, { sent_at: new Date() });
    }

    return responses.map((response) => response.id.id);
  }

  private watchMessages() {
    this.client.on('message', this.handleIncomingMessage.bind(this));
  }

  private handleIncomingMessage(message: Message) {
    if (!message.hasQuotedMsg) {
      return;
    }

    message.getQuotedMessage().then((quotedMessage) => {
      const quotedMessageId = quotedMessage.id.id;

      const payload: MessageReplyWebhookDto = {
        content: message.body,
        phone: `+${message.from.split('@')[0]}`,
        message_id: quotedMessageId,
      };

      this.whatsappApiService.messageReplyWebhook(payload).subscribe();
    });
  }

  private getMessageText(payload: { subject: string; body: string }) {
    return `*${payload.subject}*\n\n${payload.body}`;
  }

  private watchQrCode() {
    this.client.on('qr', this.generateDataUrl);
  }

  private generateDataUrl(qr: string) {
    qrcode.toDataURL(qr).then(console.log);
  }

  private watchReady() {
    this.client.on('ready', () => {
      this.logger.log('WhatsApp client successfully initialised');
    });
  }
}
