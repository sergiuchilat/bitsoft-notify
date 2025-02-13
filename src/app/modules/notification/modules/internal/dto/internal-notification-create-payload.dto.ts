import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID, Length } from 'class-validator';
import { Language } from '@/app/enum/language.enum';

export class NotificationTranslationDto {
  @ApiProperty({ example: 'en', description: 'Language', enum: Language })
    language: Language;

  @ApiProperty({ example: 'Subject', description: 'Subject', type: String })
  @Length(1, 255, {
    message: 'Subject must contain $constraint1 characters',
  })
    subject: string;

  @ApiProperty({ example: 'Body', description: 'Body', type: String })
  @Length(1, 1000, {
    message: 'Body must contain $constraint1 characters',
  })
    body: string;
}

export class InternalNotificationCreatePayloadDto {
  @ApiProperty({
    example: '74326f56-16ca-49dd-9679-deb992d5534d',
    description: 'Sender Uuid, can be null' ,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
    sender_uuid: null|string;

  @ApiProperty({
    example: NotificationTranslationDto,
    description: 'Notification translations',
    name: 'translations',
    type: [NotificationTranslationDto],
  })
  @IsArray()
    translations: NotificationTranslationDto[];
  @ApiProperty({
    example: ['74326f56-16ca-49dd-9679-deb992d5534d'],
    description: 'Notification receivers',
    name: 'receivers',
    type: String,
  })
  @IsArray()
  @IsUUID('all', { each: true })
    receivers: string[];
}
