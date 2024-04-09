import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@/app/enum/language.enum';
import { Type } from 'class-transformer';

export class CallbackURLSsDto{
  // @ApiProperty ({ example: 'http://localhost:5555/telegram/subscribe/success', description: 'Subscribed success URL' })
  @ApiProperty ({ example: 'http://localhost:5555/telegram/subscribe/success', description: 'Subscribed success URL' })
  //@IsUrl ({ require_protocol: false }, { message: 'subscribed_success must be a URL' })
  @IsString ({ message: 'subscribed_success must be a URL' })
  @Length(0, 2048, {
    message: 'subscribed_success must contain from $constraint1 to $constraint2 characters',
  })
  @IsOptional()
    subscribed_success: string;

  // @ApiProperty ({ example: 'http://localhost:5555/telegram/subscribe/error', description: 'Subscribed error URL' })
  @ApiProperty ({ example: 'http://localhost:5555/telegram/subscribe/error', description: 'Subscribed error URL' })
  // @IsUrl ({ require_protocol: true }, { message: 'subscribed_error must be a URL' })
  @IsString ({ message: 'subscribed_error must be a URL' })
  @Length(0, 2048, {
    message: 'subscribed_error must contain from $constraint1 to $constraint2 characters',
  })
  @IsOptional()
    subscribed_error: string;

  @ApiProperty ({ example: 'http://localhost:5555/telegram/unsubscribe', description: 'Unsubscribe URL' })
  // @IsUrl ({ require_protocol: true }, { message: 'unsubscribe_url must be a URL' })
  @IsString ({ message: 'unsubscribe_url must be a URL' })
  @Length(0, 2048, {
    message: 'subscribed_success must contain from $constraint1 to $constraint2 characters',
  })
    unsubscribe: string;
}

export class TelegramSubscriberCreatePayloadDto {
  @ApiProperty ({ example: '74326f56-16ca-49dd-9679-deb992d5534d', description: 'Subscriber id' })
  @IsString ({ message: 'subscriber_id must be a string' })
  @Length(1, 36, {
    message: 'subscriber_id must contain from $constraint1 to $constraint2 characters',
  })
    subscriber_uuid: string;

  @ApiProperty ({ example: 'en', description: 'Language', enum: Language })
  @IsString ({ message: 'language must be a string' })
    language: Language;
  
  @ApiProperty ({ example: CallbackURLSsDto, description: 'Callback URLs' })
  @Type(() => CallbackURLSsDto)
  @ValidateNested()
    callback_urls: CallbackURLSsDto;
}