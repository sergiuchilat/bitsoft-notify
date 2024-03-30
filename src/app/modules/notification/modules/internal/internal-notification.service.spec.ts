import { InternalNotificationService } from './internal-notification.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, IsNull, Repository } from 'typeorm';
import { InternalNotificationReceiver } from './entities/internal-notification-receiver.entity';
import { InternalNotification } from './entities/internal-notification.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('NotificationInternalService', () => {
  let notificationInternalService: InternalNotificationService;

  let notificationReceiverRepository: Repository<InternalNotificationReceiver>;
  let notificationRepository: Repository<InternalNotification>;
  let dataSourceMock: DataSource;
  let eventEmmiter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternalNotificationService,
        {
          provide: EventEmitter2,
          useValue: jest.fn(),
        },
        {
          provide: DataSource,
          useValue: jest.fn(),
        },
        {
          provide: getRepositoryToken(InternalNotification),
          useValue: {
            findAndCount: jest.fn(),
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(InternalNotificationReceiver),
          useValue: {
            findAndCount: jest.fn(),
            findOneOrFail: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    eventEmmiter = module.get(EventEmitter2);
    dataSourceMock = module.get(DataSource);
    notificationReceiverRepository = module.get(getRepositoryToken(InternalNotificationReceiver));
    notificationRepository = module.get(getRepositoryToken(InternalNotification));

    notificationInternalService = module.get(InternalNotificationService);
  });

  it('should be defined', () => {
    expect(notificationInternalService).toBeDefined();
  });

  describe('confirmReadByReceiver', () => {
    it('should get notification and receiver then save', async () => {
      const findNotificationSpy = jest.spyOn(notificationRepository, 'findOneOrFail');
      const findReceiverSpy = jest.spyOn(notificationReceiverRepository, 'findOneOrFail');
      const saveReceiverSpy = jest.spyOn(notificationReceiverRepository, 'save');

      const receiverMock = {
        id: 0,
        notification_id: 0,
        receiver_uuid: 'receiver-uuid',
        sent_at: '2022-01-01',
        viewed_at: '2022-01-01',
        confirm_view_at: '2022-01-01',
      };

      const notificationMock = {
        id: 0,
        uuid: 'uuid',
        sender_uuid: 'sender-uuid',
        created_at: '2022-01-01',
      };

      findNotificationSpy.mockReturnValueOnce(Promise.resolve(notificationMock as any));
      findReceiverSpy.mockReturnValueOnce(Promise.resolve(receiverMock as any));

      jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));

      await notificationInternalService.confirmReadByReceiver('receiver-uuid', 'notification-uuid');

      expect(findNotificationSpy).toBeCalledWith({ where: { uuid: 'notification-uuid' } });

      expect(findReceiverSpy).toBeCalledWith({
        where: {
          notification_id: 0,
          receiver_uuid: 'receiver-uuid',
          confirm_view_at: IsNull(),
        },
      });

      expect(saveReceiverSpy).toBeCalledWith({ ...receiverMock, confirm_view_at: new Date('2024-01-01') });
    });

    it('should throw not found exception on error', async () => {
      const findNotificationSpy = jest.spyOn(notificationRepository, 'findOneOrFail');

      findNotificationSpy.mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      try {
        await notificationInternalService.confirmReadByReceiver('receiver-uuid', 'notification-uuid');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
