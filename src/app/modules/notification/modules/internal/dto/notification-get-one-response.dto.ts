import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class NotificationGetOneResponseDto {
  @Expose()
    id: string;

  @Expose()
    uuid: string;

  @Expose()
  @ApiProperty({ example: 'Subject', description: 'Subject', type: String })
    subject: string;

  @Expose()
    body: string;

  @Expose()
    sent_at: Date;

  @Expose()
    viewed_at: Date;
}
