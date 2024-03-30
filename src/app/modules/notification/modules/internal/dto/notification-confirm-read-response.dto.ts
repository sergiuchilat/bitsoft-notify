import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class NotificationConfirmReadResponseDto {
  @Expose()
  @ApiProperty({
    example: '2023-12-07T07:11:17.218Z',
    description: 'Datetime when notifications was sent',
    type: Date,
  })
    sent_at: Date;

  @Expose()
  @ApiProperty({
    example: '2023-12-07T07:11:17.218Z',
    description: 'Datetime when notifications was viewed by receiver',
    type: Date,
  })
    viewed_at: Date;

  @Expose()
  @ApiProperty({
    example: '2023-12-07T07:11:17.218Z',
    description: 'Datetime when notifications viewed was confirmed by receiver',
    type: Date,
  })
    confirm_view_at: Date;
}
