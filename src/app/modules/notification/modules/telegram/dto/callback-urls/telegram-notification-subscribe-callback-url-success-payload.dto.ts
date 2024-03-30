import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class TelegramNotificationSubscribeCallbackUrlSuccessPayloadDto {
  @ApiProperty({ example: '1', description: 'Subscriber id' })
  @IsString({ message: 'Subscriber id must be a string' })
  readonly subscriber_id: string;

  @ApiProperty({ example: 'telegram_username', description: 'Telegram username' })
  @IsString({ message: 'Telegram username must be a string' })
  readonly telegram_username: string;

  @ApiProperty({ example: 'bot_name', description: 'Bot name' })
  @IsString({ message: 'Bot name must be a string' })
  readonly bot_name: string;

  @ApiProperty({ example: 123123, description: 'Chat id' })
  @IsNumber({}, { message: 'Chat id must be a number' })
  readonly chat_id: number;
}