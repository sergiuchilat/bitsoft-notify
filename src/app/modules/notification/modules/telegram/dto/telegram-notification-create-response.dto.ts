import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Language } from '@/app/enum/language.enum';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TelegramNotificationCreateResponseDto {
  @ApiProperty({ example: 'Subject', description: 'Subject' })
  @IsString({ message: 'Subject must be a string' })
  @Length(1, 255, {
    message: 'Subject must contain from $constraint1 to $constraint2 characters',
  })
  @Expose()
    subject: string;

  @ApiProperty({ example: 'Body', description: 'Body' })
  @IsString({ message: 'Body must be a string' })
  @Length(1, 1000, {
    message: 'Body must contain from $constraint1 to $constraint2 characters',
  })
  @Expose()
    body: string;

  @ApiPropertyOptional({ example: 'EN', description: 'Language', type: 'string', enum: Language })
  @IsEnum(Language)
  @IsOptional()
  @Expose()
    language?: Language | null;

  @ApiProperty({
    example: ['74326f56-16ca-49dd-9679-deb992d5534d'],
    description: 'Notification receivers',
    name: 'receivers',
  })
  @IsString()
  @Expose()
    receiver_id: string;

  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    description: 'Created at',
    name: 'created_at',
  })
  @IsDate()
  @Expose()
    created_at: Date;
}
