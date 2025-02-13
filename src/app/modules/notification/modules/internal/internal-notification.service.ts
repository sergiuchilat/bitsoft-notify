import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { InternalNotification } from './entities/internal-notification.entity';
import { InternalNotificationCreatePayloadDto } from './dto/internal-notification-create-payload.dto';
import { plainToInstance } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { InternalNotificationCreateResponseDto } from '@/app/modules/notification/modules/internal/dto/internal-notification-create-response.dto';
import { InternalNotificationTranslation } from '@/app/modules/notification/modules/internal/entities/internal-notification-translation.entity';
import { InternalNotificationReceiver } from '@/app/modules/notification/modules/internal/entities/internal-notification-receiver.entity';
import { Language } from '@/app/enum/language.enum';
import { NotificationGetOneResponseDto } from '@/app/modules/notification/modules/internal/dto/notification-get-one-response.dto';
import { EventsGateway } from '@/app/services/events-gateway/events.gateway';
import { InternalNotificationRepository } from '@/app/modules/notification/modules/internal/internal-notification.repository';
import { NotificationConfirmReadResponseDto } from '@/app/modules/notification/modules/internal/dto/notification-confirm-read-response.dto';
import { NotificationUnreadCountResponseDto } from '@/app/modules/notification/modules/internal/dto/notification-unread-count-response.dto';

@Injectable()
export class InternalNotificationService {
  constructor(
    @InjectRepository(InternalNotification)
    private readonly notificationRepository: InternalNotificationRepository,
    @InjectRepository(InternalNotificationReceiver)
    private readonly notificationReceiverRepository: Repository<InternalNotificationReceiver>,
    private readonly dateSource: DataSource,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(
    notification: InternalNotificationCreatePayloadDto,
  ): Promise<InternalNotificationCreateResponseDto> {
    // Convert incoming DTO to entity and assign a new UUID.
    const notificationEntity = plainToInstance(InternalNotification, notification);
    notificationEntity.uuid = uuidv4();

    // Run all database operations within a transaction.
    const savedNotification = await this.dateSource.transaction(async (manager) => {
      // Save the main notification entity.
      const notificationSaved = await manager.save(InternalNotification, notificationEntity);

      // Save translations (if any) in parallel after setting the foreign key.
      if (notificationEntity.translations && notificationEntity.translations.length > 0) {
        const translations = notificationEntity.translations.map((translation) => ({
          ...translation,
          notification_id: notificationSaved.id,
        }));

        await manager.save(InternalNotificationTranslation, translations);
      }

      // Prepare receiver entities and emit notification-created events.
      if (notification.receivers && notification.receivers.length > 0) {
        const receiverEntities = notification.receivers.map((receiverUuid) => {
          // Emit the event for notification creation (if this is a side effect you need within the transaction).
          this.emitEventNotificationCreated({
            receiver: receiverUuid,
            uuid: notificationSaved.uuid,
            translations: (notificationEntity.translations || []).map(({ language, subject }) => ({
              language,
              subject,
            })),
          });

          return {
            notification_id: notificationSaved.id,
            receiver_uuid: receiverUuid,
            sent_at: new Date(),
            viewed_at: null,
            confirm_view_at: null,
          } as InternalNotificationReceiver;
        });

        await manager.save(InternalNotificationReceiver, receiverEntities);
      }

      // Return the saved notification for further processing.
      return notificationSaved;
    });

    // Emit unread counter events outside the transaction (in parallel).
    if (notification.receivers && notification.receivers.length > 0) {
      await Promise.all(
        notification.receivers.map((receiverUuid) => this.emitEventUnreadCounter(receiverUuid)),
      );
    }

    // Return the response DTO.
    return plainToInstance(InternalNotificationCreateResponseDto, savedNotification);
  }


  async getAllPaginated(options: IPaginationOptions): Promise<any> {
    try {
      const [items, count] = await this.notificationRepository.findAndCount({
        relations: ['translations', 'receivers'],
        skip: (Number(options.page) - 1) * Number(options.limit),
        take: Number(options.limit),
        order: {
          created_at: 'DESC',
        },
      });

      return {
        items: items,
        meta: {
          itemCount: items.length,
          itemsPerPage: options.limit,
          totalItems: count,
          currentPage: options.page,
          totalPages: Math.ceil(count / Number(options.limit)),
        },
      };
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async getOne(uuid: string): Promise<any> {
    try {
      return await this.notificationRepository.findOneOrFail({
        where: {
          uuid: uuid,
        },
        relations: ['translations', 'receivers'],
      });
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async getAllPaginatedByReceiver(
    receiver_uuid: string,
    language: Language,
    options: IPaginationOptions,
  ): Promise<any> {
    return await this.notificationRepository.getAllPaginatedByReceiver(receiver_uuid, language, options);
  }

  async getUnreadPaginatedByReceiver(
    receiver_uuid: string,
    language: Language,
    options: IPaginationOptions,
  ): Promise<any> {
    return await this.notificationRepository.getUnreadPaginatedByReceiver(receiver_uuid, language, options);
  }

  async getOneByReceiver(
    receiver_uuid: string,
    notification_uuid: string,
    language: Language,
  ): Promise<NotificationGetOneResponseDto> {
    const notification: any = await this.notificationRepository.getOneByReceiver(
      receiver_uuid,
      notification_uuid,
      language,
    );
    await this.markAsViewed(receiver_uuid, notification.id);
    notification.id = undefined;
    return notification;
  }

  private async markAsViewed(receiver_uuid: string, notification_id: number) {
    const notificationReceiver = await this.notificationReceiverRepository.findOne({
      where: {
        notification_id: notification_id,
        receiver_uuid: receiver_uuid,
      },
    });

    notificationReceiver.viewed_at = new Date();
    await this.notificationReceiverRepository.save(notificationReceiver);
    await this.emitEventUnreadCounter(receiver_uuid);
  }

  async confirmReadByReceiver(
    receiver_uuid: string,
    notification_uuid: string,
  ): Promise<NotificationConfirmReadResponseDto> {
    try {
      const notificationId = await this.notificationRepository
        .findOneOrFail({ where: { uuid: notification_uuid } })
        .then((notification) => notification.id);

      const notificationReceiver = await this.notificationReceiverRepository.findOneOrFail({
        where: {
          notification_id: notificationId,
          receiver_uuid: receiver_uuid,
          confirm_view_at: IsNull(),
        },
      });

      if (!notificationReceiver.viewed_at) {
        notificationReceiver.viewed_at = new Date();
      }
      notificationReceiver.confirm_view_at = new Date();
      await this.notificationReceiverRepository.save(notificationReceiver);

      return plainToInstance(NotificationConfirmReadResponseDto, notificationReceiver);
    } catch (e) {
      console.log(e);
      throw new NotFoundException();
    }
  }

  async getUnreadCountByReceiver(receiver_uuid: string): Promise<NotificationUnreadCountResponseDto> {
    try {
      const count = await this.notificationReceiverRepository.count({
        where: {
          receiver_uuid: receiver_uuid,
          viewed_at: IsNull(),
        },
      });

      const lastNotification = await this.notificationReceiverRepository.findOne({
        where: {
          receiver_uuid: receiver_uuid,
        },
        order: {
          id: 'DESC',
        },
      });

      return plainToInstance(NotificationUnreadCountResponseDto, {
        count: count,
        last_notification_sent: lastNotification.sent_at,
      });
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async delete(uuid: string): Promise<void> {
    try {
      await this.notificationRepository.findOneOrFail({
        where: [{ uuid }],
      });
      await this.notificationRepository.delete({
        uuid,
      });
    } catch (e) {
      throw new NotFoundException();
    }
  }

  private async emitEventUnreadCounter(receiver_uuid: string) {
    const response = await this.getUnreadCountByReceiver(receiver_uuid);
    const roomName = `room:${receiver_uuid}`;
    this.eventsGateway.server.to(roomName).emit('notification.internal.unread-count', {
      receiver: receiver_uuid,
      count: response.count,
    });
  }

  private emitEventNotificationCreated(notification: any) {
    // this.eventsGateway.server.emit('notification.internal.created', notification);
    // this.eventsGateway.server.to(`room:all`).emit('notification.internal.created', notification);
    const roomName = `room:${notification.receiver}`;
    this.eventsGateway.server.to(roomName).emit('notification.internal.created', notification);
  }

  async truncate() {
    await this.notificationRepository.query('TRUNCATE TABLE messages CASCADE;');
  }
}
