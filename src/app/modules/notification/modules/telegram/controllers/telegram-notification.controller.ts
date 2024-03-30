import {Body, Controller, Delete, Get, HttpStatus, Param, Post, Res} from '@nestjs/common';
import { TelegramNotificationService } from '@/app/modules/notification/modules/telegram/services/telegram-notification.service';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TelegramNotificationCreatePayloadDto } from '@/app/modules/notification/modules/telegram/dto/telegram-notification-create-payload.dto';
import { Response } from 'express';
import { TelegramNotificationCreateResponseDto } from '@/app/modules/notification/modules/telegram/dto/telegram-notification-create-response.dto';
import {
  TelegramNotificationSubscriberDto
} from '@/app/modules/notification/modules/telegram/dto/telegram-notification-subscriber.dto';
import {
  TelegramSubscriberCreatePayloadDto
} from '@/app/modules/notification/modules/telegram/dto/telegram-subscriber-create-payload.dto';

@Controller('notifications/telegram')

@ApiTags('Notifications Telegram')
export class TelegramNotificationController {
  constructor(private readonly notificationService: TelegramNotificationService) {}
  
  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to telegram notifications' })

  async subscribe(
    @Body() subscriber: TelegramSubscriberCreatePayloadDto,
    @Res() response: Response,
  ) {
    response
      .status(HttpStatus.CREATED)
      .send(await this.notificationService.subscribe(subscriber));
  }

  @Delete('unsubscribe/:receiver_uuid')
  @ApiOperation({ summary: 'UnSubscribe from telegram notifications' })
  @ApiParam({ name: 'receiver_uuid', description: 'Receiver uuid', type: 'string' })
  async unsubscribe(@Param('receiver_uuid') receiver_uuid: string, @Res() response: Response) {
    response.status(HttpStatus.OK).send(await this.notificationService.unsubscribe(receiver_uuid));
  }

  @Get('subscribed/:receiver_uuid')
  @ApiOperation({ summary: 'Check if subscribed' })
  @ApiParam({ name: 'receiver_uuid', description: 'Receiver uuid', type: 'string' })
  async isSubscribed(@Param('receiver_uuid') receiver_uuid: string, @Res() response: Response) {
    response.status(HttpStatus.OK).send(await this.notificationService.isSubscribed(receiver_uuid));
  }

  @Get('subscribers')
    @ApiOperation({ summary: 'Get all subscribers' })
    @ApiOkResponse({
      description: 'Subscribers',
      type: TelegramNotificationSubscriberDto,
      isArray: true,
    })
  async getSubscribers(@Res() response: Response) {
    response.status(HttpStatus.OK).send(await this.notificationService.getSubscribers());
  }

  @Post()
  @ApiOperation({ summary: 'Create new telegram notification' })
  @ApiOkResponse({
    description: 'Created notifications',
    type: TelegramNotificationCreateResponseDto,
    isArray: true,
  })
  async createNotification(
    @Body() notificationCreatePayloadDto: TelegramNotificationCreatePayloadDto,
    @Res() response: Response,
  ) {
    response
      .status(HttpStatus.CREATED)
      .send(await this.notificationService.createNotification(notificationCreatePayloadDto));
  }
}
