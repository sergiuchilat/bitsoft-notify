import { Repository } from 'typeorm';
import { InternalNotification } from '@/app/modules/notification/modules/internal/entities/internal-notification.entity';
import { Language } from '@/app/enum/language.enum';
import { NotificationGetOneResponseDto } from '@/app/modules/notification/modules/internal/dto/notification-get-one-response.dto';
import { InternalNotificationTranslation } from '@/app/modules/notification/modules/internal/entities/internal-notification-translation.entity';
import { InternalNotificationReceiver } from '@/app/modules/notification/modules/internal/entities/internal-notification-receiver.entity';
import { plainToInstance } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';
import { IPaginationOptions, paginateRaw } from 'nestjs-typeorm-paginate';

export interface InternalNotificationRepository extends Repository<InternalNotification> {
  this: Repository<InternalNotification>;

  getAllPaginatedByReceiver(
    receiver_uuid: string,
    language: Language,
    options: IPaginationOptions,
  ): Promise<any>;

  getOneByReceiver(
    receiver_uuid: string,
    notification_uuid: string,
    language: Language,
  ): Promise<NotificationGetOneResponseDto>;

  getUnreadPaginatedByReceiver(
    receiver_uuid: string,
    language: Language,
    options: IPaginationOptions,
  ): Promise<any>;
}

export const customInternalNotificationRepository: Pick<InternalNotificationRepository, any> = {
  async getAllPaginatedByReceiver(
    receiver_uuid: string,
    language: Language,
    options: IPaginationOptions,
  ): Promise<any> {
    try {
      const queryBuilder = this.createQueryBuilder('notifications')
        .select(['notifications.uuid AS uuid', 'notifications.sender_uuid AS sender_uuid'])
        .innerJoin(
          InternalNotificationReceiver,
          'receiver',
          'receiver.notification_id = notifications.id AND receiver.receiver_uuid = :receiver_uuid',
          { receiver_uuid: receiver_uuid },
        )
        .addSelect('receiver.sent_at', 'sent_at')
        .addSelect('receiver.viewed_at', 'viewed_at')
        .innerJoin(
          InternalNotificationTranslation,
          'translation',
          'translation.notification_id = notifications.id AND translation.language = :language ',
          { language },
        )
        .addSelect('translation.subject', 'subject')
        .skip((Number(options.page) - 1) * Number(options.limit))
        .orderBy('receiver.sent_at', 'DESC')
        .take(Number(options.limit));
      return await paginateRaw(queryBuilder, options);
    } catch (e) {
      throw new NotFoundException();
    }
  },
  async getOneByReceiver(
    receiver_uuid: string,
    notification_uuid: string,
    language: Language,
  ): Promise<NotificationGetOneResponseDto> {
    try {
      const notification = await this.createQueryBuilder('notifications')
        .select('notifications.id', 'id')
        .select('notifications.uuid', 'uuid')
        .innerJoin(
          InternalNotificationTranslation,
          'translation',
          'translation.notification_id = notifications.id AND translation.language = :language',
          { language },
        )
        .addSelect('translation.notification_id', 'notification_id')
        .addSelect('translation.subject', 'subject')
        .addSelect('translation.body', 'body')
        .innerJoin(
          InternalNotificationReceiver,
          'receiver',
          'receiver.notification_id = notifications.id AND receiver.receiver_uuid = :receiver_uuid',
          { receiver_uuid: receiver_uuid },
        )
        .addSelect('receiver.sent_at', 'sent_at')
        .addSelect('receiver.viewed_at', 'viewed_at')
        .where('notifications.uuid = :notification_uuid', { notification_uuid })
        .getRawOne();
      notification.id = notification.notification_id;

      return plainToInstance(NotificationGetOneResponseDto, notification);
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
  },

  async getUnreadPaginatedByReceiver(
    receiver_uuid: string,
    language: Language,
    options: IPaginationOptions,
  ): Promise<any> {
    try {
      const queryBuilder = this.createQueryBuilder('notifications')
        .select(['notifications.uuid AS uuid', 'notifications.sender_uuid AS sender_uuid'])
        .innerJoin(
          InternalNotificationReceiver,
          'receiver',
          'receiver.notification_id = notifications.id AND receiver.receiver_uuid = :receiver_uuid AND receiver.viewed_at IS NULL',
          { receiver_uuid: receiver_uuid },
        )
        .addSelect('receiver.sent_at', 'sent_at')
        //.addSelect('receiver.viewed_at', 'viewed_at')
        .innerJoin(
          InternalNotificationTranslation,
          'translation',
          'translation.notification_id = notifications.id AND translation.language = :language ',
          { language },
        )
        .addSelect('translation.subject', 'subject')
        // .addSelect('translation.body', 'body')
        .skip((Number(options.page) - 1) * Number(options.limit))
        .orderBy('receiver.sent_at', 'DESC')
        .take(Number(options.limit));
      return await paginateRaw(queryBuilder, options);
    } catch (e) {
      throw new NotFoundException();
    }
  },
};
