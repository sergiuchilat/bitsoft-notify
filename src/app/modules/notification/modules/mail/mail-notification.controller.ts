import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { MailNotificationService } from '@/app/modules/notification/modules/mail/mail-notification.service';
import { MailNotificationCreatePayloadDto } from '@/app/modules/notification/modules/mail/dto/mail-notification-create-payload.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller({
  version: '1',
  path: 'notifications/mail',
})
@ApiTags('Notifications Mail')
export class MailNotificationController {
  constructor(private readonly notificationService: MailNotificationService) {}

  @Post()
  createNotification(@Body() notification: MailNotificationCreatePayloadDto, @Res() response: Response,) {
    response
      .status(HttpStatus.CREATED)
      .send(this.notificationService.createNotification(notification));
  }

  @Get('unsent')
  async getUnsentNotifications(@Res() response: Response) {
    response
      .status(HttpStatus.OK)
      .send(await this.notificationService.getUnsentNotifications());
  }

  @Get('sent')
  async getSentNotifications(@Res() response: Response) {
    response
      .status(HttpStatus.OK)
      .send(await this.notificationService.getSentNotifications());
  }
}
