import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, Length } from 'class-validator';

export class TelegramGroupNotificationCreatePayloadDto {
  @ApiProperty({ example: 'Subject', description: 'Subject' })
  @IsString({ message: 'Subject must be a string' })
  @Length(1, 255, {
    message: 'Subject must contain from $constraint1 to $constraint2 characters',
  })
    subject: string;

  @ApiProperty({ example: 'Body', description: 'Body' })
  @IsString({ message: 'Body must be a string' })
  @Length(1, 1000, {
    message: 'Body must contain from $constraint1 to $constraint2 characters',
  })
    body: string;

  @ApiProperty({
    example: ['-123456789'],
    description: 'Notification group IDs',
    name: 'receivers',
  })
  @IsString({ each: true })
  @IsArray()
    receivers: string[];
}
