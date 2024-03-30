import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class NotificationUnreadCountResponseDto {
  @Expose()
  @ApiProperty({
    example: 10,
    description: 'Number of unread notifications',
    type: Number,
  })
    count: number;

  @Expose()
  @ApiProperty({
    example: '2023-12-07T07:11:17.218Z',
    description: 'Last notification sent datetime for receiver',
    type: Date,
  })
    last_notification_sent: Date;
}
