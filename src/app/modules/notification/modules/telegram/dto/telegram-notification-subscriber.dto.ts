import {IsEnum, IsNotEmpty, IsNumber, IsString} from 'class-validator';
import {Language} from '@/app/enum/language.enum';

export class TelegramNotificationSubscriberDto{
  @IsString()
  @IsNotEmpty()
  readonly receiver_uuid: string;

  @IsNumber()
  @IsNotEmpty()
  readonly chat_id: number;

  @IsEnum(Language)
  @IsNotEmpty()
  readonly language: Language;
}