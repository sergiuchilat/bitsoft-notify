import { Body, Controller, Get, Post } from '@nestjs/common';
import { SendMessageDto } from '@/app/modules/notification/modules/whatsapp/dto/send-message.dto';
import { WhatsappNotificationService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-notification.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: 'notifications/whatsapp',
})
@ApiTags('Whatsapp Notification')
export class WhatsappNotificationController {
  constructor(
    private readonly whatsAppNotificationService: WhatsappNotificationService,
  ) {}

  @Get('chats')
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
  getChatList() {
    return this.whatsAppNotificationService.getChatsList();
  }

  @Post('group')
  sendNotification(@Body() payload: SendMessageDto) {
    return this.whatsAppNotificationService.sendMessage(payload);
  }

  @Post('initialize')
  initializeClient() {
    return this.whatsAppNotificationService.initialiseClient();
  }
}
