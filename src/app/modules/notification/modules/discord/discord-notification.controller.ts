import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { DiscordNotificationService } from './discord-notification.service';
import { DiscordNotificationCreatePayloadDto } from '@/app/modules/notification/modules/discord/dto/discord-notification-create-payload.dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocalization } from '@/app/request/decorators/request-localization.decorator';
import { Language } from '@/app/enum/language.enum';

@Controller({
  version: '1',
  path: 'notifications/discord',
})
@ApiTags('Notifications Discord')
export class DiscordNotificationController {
  constructor(private readonly discordNotificationService: DiscordNotificationService) {}

  @Post()
  async sendNotification(
    @Body() notification: DiscordNotificationCreatePayloadDto,
    @Res() response: Response,
    @RequestLocalization() language: Language,
  ) {
    response
      .status(HttpStatus.CREATED)
      .send(await this.discordNotificationService.sendNotification(notification, language));
  }
}
