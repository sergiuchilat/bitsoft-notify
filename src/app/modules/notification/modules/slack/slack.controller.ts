import { Body, Controller, Get, Post } from '@nestjs/common';
import { SendMessageDto } from '@/app/modules/notification/modules/whatsapp/dto/send-message.dto';
import { SlackService } from '@/app/modules/notification/modules/slack/slack.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Slack Notification')
@Controller({
  version: '1',
  path: 'notifications/slack',
})
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('conversations')
  getConversationsList() {
    return this.slackService.getConversationsList();
  }

  @Post()
  sendNotification(@Body() payload: SendMessageDto) {
    return this.slackService.sendMessage(payload);
  }
}
