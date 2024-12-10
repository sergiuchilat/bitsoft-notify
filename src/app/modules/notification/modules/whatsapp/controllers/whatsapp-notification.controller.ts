import { Body, Controller, Get, Post } from '@nestjs/common';
import { SendMessageDto } from '@/app/modules/notification/modules/whatsapp/dto/send-message.dto';
import { WhatsappNotificationService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-notification.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendPersonalMessageDto } from '@/app/modules/notification/modules/whatsapp/dto/sent-personal-message.dto';

@Controller({
  version: '1',
  path: 'notifications/whatsapp',
})
@ApiTags('Whatsapp Notification')
export class WhatsappNotificationController {
  constructor(
    private readonly whatsAppNotificationService: WhatsappNotificationService,
  ) {}

  @ApiOperation({
    summary: 'Use _serialized field as group ID to send messages',
  })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: {
            server: 'g.us',
            user: '120363352716331799',
            _serialized: '120363352716331799@g.us',
          },
        },
      ],
    },
  })
  @Get('chats')
  getChatList() {
    return this.whatsAppNotificationService.getChatsList();
  }

  @Post('phone')
  notifyByPhone(@Body() payload: SendPersonalMessageDto) {
    return this.whatsAppNotificationService.sendPersonalMessage(payload);
  }

  @Post('group')
  notifyGroup(@Body() payload: SendMessageDto) {
    return this.whatsAppNotificationService.sendMessage(payload);
  }

  @Post('initialize')
  initializeClient() {
    return this.whatsAppNotificationService.initializeClient();
  }

  @Post('destroy')
  destroyClient() {
    return this.whatsAppNotificationService.destroyClient();
  }
}
