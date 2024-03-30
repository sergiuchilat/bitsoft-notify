import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Language } from '@/app/enum/language.enum';

export class MailNotificationCreatePayloadDto {
  @ApiProperty({ example: 'Subject', description: 'Subject' })
  @IsString({ message: 'Subject must be a string' })
  @Length(1, 255, {
    message: 'Subject must contain from $constraint1 to $constraint2 characters',
  })
    subject: string;

  @ApiProperty({ example: 'Body', description: 'Body' })
  @IsString({ message: 'Body must be a string' })
  @Length(1, 6000, {
    message: 'Body must contain from $constraint1 to $constraint2 characters',
  })
    body: string;

  @ApiPropertyOptional({ example: 'en', description: 'Language', type: 'string', enum: Language })
  @IsEnum(Language)
  @IsOptional()
    language?: Language | null;

  @ApiProperty({
    example: ['chilatsergiu@gmail.com'],
    description: 'Notification receivers',
    name: 'receivers',
  })
  @IsString({ each: true })
  @IsArray()
  @IsEmail({}, { each: true })
    receivers: string[];
}
