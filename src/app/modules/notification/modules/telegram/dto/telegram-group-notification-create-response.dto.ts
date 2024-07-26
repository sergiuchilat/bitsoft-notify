import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, Length } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TelegramGroupNotificationCreateResponseDto {
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

  @ApiProperty({
    example: ['-123456789'],
    description: 'Notification groups receivers',
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
