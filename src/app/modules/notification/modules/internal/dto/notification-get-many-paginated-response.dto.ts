import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import PaginateMetaResponseDto from '@/app/response/dto/paginate-meta-response.dto';

@Exclude()
export class NotificationItemForReceiverDto {
  @Expose()
  @ApiProperty({
    example: '2023-12-07T07:11:17.218Z',
    description: 'Datetime when notifications was sent',
    type: Date,
  })
    sent_at: Date;

  @ApiProperty({
    example: '2023-12-07T07:11:17.218Z',
    description: 'Datetime when notifications was viewed by receiver',
    type: Date,
  })
    viewed_at: Date;

  @Expose()
  @ApiProperty({ example: 'Subject', description: 'Subject', type: String })
    subject: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Message UUID' })
    uuid: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID' })
    sender_uuid: string;
}

@Exclude()
export class NotificationGetManyPaginatedResponseDto {
  @Expose()
  @ApiProperty({
    example: NotificationItemForReceiverDto,
    description: 'List of notifications',
    type: [NotificationItemForReceiverDto],
  })
    items: NotificationItemForReceiverDto[];

  @Expose()
  @ApiProperty({ example: PaginateMetaResponseDto, description: 'Paginate meta' })
    meta: PaginateMetaResponseDto;
}
