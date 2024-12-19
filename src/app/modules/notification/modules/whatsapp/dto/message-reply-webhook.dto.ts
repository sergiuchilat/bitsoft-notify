import { Expose } from 'class-transformer';

export class MessageReplyWebhookDto {
  @Expose()
  message_id: string;

  @Expose()
  phone: string;

  @Expose()
  content: string;
}
