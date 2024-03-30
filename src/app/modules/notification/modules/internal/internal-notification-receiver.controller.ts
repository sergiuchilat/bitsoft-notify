import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { InternalNotificationService } from './internal-notification.service';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import PaginatorConfigInterface from '@/database/interfaces/paginator-config.interface';
import { Language } from '@/app/enum/language.enum';
import { RequestUser } from '@/app/request/decorators/request-user.decorator';
import RequestUserInterface from '@/app/request/interfaces/request-user.Interface';
import { AuthGuard } from '@/app/middleware/guards/auth.guard';
import { RequestLocalization } from '@/app/request/decorators/request-localization.decorator';
import {
  NotificationGetManyPaginatedResponseDto,
  NotificationItemForReceiverDto,
} from '@/app/modules/notification/modules/internal/dto/notification-get-many-paginated-response.dto';
import { NotificationConfirmReadResponseDto } from '@/app/modules/notification/modules/internal/dto/notification-confirm-read-response.dto';
import { NotificationUnreadCountResponseDto } from '@/app/modules/notification/modules/internal/dto/notification-unread-count-response.dto';

@ApiTags('Notifications Internal Receiver')
@Controller('notifications/internal/own')
@UseGuards(AuthGuard)
export class InternalNotificationReceiverController {
  constructor(private readonly messageService: InternalNotificationService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all own receiver internal notifications' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
  })
  @ApiHeader({
    name: 'x-localization',
    description: 'Language',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Page size',
    type: 'number',
    required: false,
  })
  @ApiOkResponse({
    description: 'List of notifications',
    type: NotificationGetManyPaginatedResponseDto,
  })
  async getAllByReceiver(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
      page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe)
      limit: number,
    @Res() response: Response,
    @RequestUser() requestUser: RequestUserInterface,
    @RequestLocalization() language: Language,
  ) {
    const paginatorConfig: PaginatorConfigInterface = {
      page,
      limit,
    };
    response
      .status(HttpStatus.OK)
      .json(await this.messageService.getAllPaginatedByReceiver(requestUser.uuid, language, paginatorConfig));
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread own receiver internal notifications' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
  })
  @ApiHeader({
    name: 'x-localization',
    description: 'Language',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Page size',
    type: 'number',
    required: false,
  })
  @ApiOkResponse({
    description: 'List of notifications',
    type: NotificationGetManyPaginatedResponseDto,
  })
  async getUnreadByReceiver(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
      page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe)
      limit: number,
    @RequestLocalization() language: Language,
    @RequestUser() requestUser: RequestUserInterface,
    @Res() response: Response,
  ) {
    const paginatorConfig: PaginatorConfigInterface = {
      page,
      limit,
    };
    response
      .status(HttpStatus.OK)
      .json(
        await this.messageService.getUnreadPaginatedByReceiver(requestUser.uuid, language, paginatorConfig),
      );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Amount of unread notification and datetime of last added notification' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
  })
  @ApiOkResponse({
    description: 'Amount of unread notification and datetime of last added notification',
    type: NotificationUnreadCountResponseDto,
  })
  async getUnreadCount(@RequestUser() requestUser: RequestUserInterface, @Res() response: Response) {
    response.status(HttpStatus.OK).json(await this.messageService.getUnreadCountByReceiver(requestUser.uuid));
  }

  @Get(':notification_uuid')
  @ApiOperation({ summary: 'Get a specified internal notification for a receiver' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
  })
  @ApiHeader({
    name: 'x-localization',
    description: 'Language',
    required: true,
  })
  @ApiParam({ name: 'notification_uuid', description: 'Notification uuid', type: 'string' })
  @ApiOkResponse({
    description: 'Notification details',
    type: NotificationItemForReceiverDto,
  })
  async getOneByReceiver(
    @Param('notification_uuid', ParseUUIDPipe) notification_uuid: string,
    @RequestLocalization() language: Language,
    @RequestUser() requestUser: RequestUserInterface,
    @Res() response: Response,
  ) {
    response
      .status(HttpStatus.OK)
      .json(await this.messageService.getOneByReceiver(requestUser.uuid, notification_uuid, language));
  }

  @Get(':notification_uuid/confirm-read')
  @ApiOperation({ summary: 'Confirmation about read of specific notification by a receiver' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
  })
  @ApiParam({ name: 'notification_uuid', description: 'Notification uuid', type: 'string' })
  @ApiOkResponse({
    description: 'Confirmed notification',
    type: NotificationConfirmReadResponseDto,
  })
  async confirmReadByReceiver(
    @Param('notification_uuid', ParseUUIDPipe) notification_uuid: string,
    @RequestUser() requestUser: RequestUserInterface,
    @Res() response: Response,
  ) {
    response
      .status(HttpStatus.OK)
      .json(await this.messageService.confirmReadByReceiver(requestUser.uuid, notification_uuid));
  }
}
