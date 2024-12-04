import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { SendMessageDto } from '@/app/modules/notification/modules/whatsapp/dto/send-message.dto.js';
import qrcode from 'qrcode';

@Injectable()
export class WhatsappNotificationService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappNotificationService.name);

  private readonly client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // for non GUI environments
      executablePath: '/usr/bin/chromium',
    },
  });

  async onModuleInit() {
    this.watchQrCode();
    this.watchReady();

    await this.initialiseClient();
  }

  async sendMessage(payload: SendMessageDto) {
    const message = `*${payload.subject}*\n\n${payload.body}`;

    for (const groupId of payload.receivers) {
      await this.client.sendMessage(groupId, message);
    }
  }

  getChatsList() {
    return this.client.getChats();
  }

  async initialiseClient() {
    try {
      await this.client.initialize();
      this.logger.log('WhatsApp client initialised');
    } catch (err) {
      this.logger.error(`Cannot initialise the client: ${err.message}`);
    }
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
