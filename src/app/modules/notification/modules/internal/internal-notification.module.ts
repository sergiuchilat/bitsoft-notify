import { Module } from '@nestjs/common';
import { InternalNotificationCrudController } from './internal-notification-crud.controller';
import { InternalNotificationService } from './internal-notification.service';
import { getDataSourceToken, getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { InternalNotification } from '@/app/modules/notification/modules/internal/entities/internal-notification.entity';
import { InternalNotificationTranslation } from '@/app/modules/notification/modules/internal/entities/internal-notification-translation.entity';
import { InternalNotificationReceiver } from '@/app/modules/notification/modules/internal/entities/internal-notification-receiver.entity';
import { InternalNotificationReceiverController } from '@/app/modules/notification/modules/internal/internal-notification-receiver.controller';
import { EventsGateway } from '@/app/services/events-gateway/events.gateway';
import { DataSource } from 'typeorm';
import { customInternalNotificationRepository } from '@/app/modules/notification/modules/internal/internal-notification.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InternalNotification,
      InternalNotificationTranslation,
      InternalNotificationReceiver,
    ]),
  ],
  exports: [TypeOrmModule, InternalNotificationService],
  controllers: [InternalNotificationCrudController, InternalNotificationReceiverController],
  providers: [
    InternalNotificationService,
    {
      provide: getRepositoryToken(InternalNotification),
      inject: [getDataSourceToken()],
      useFactory(dataSource: DataSource) {
        return dataSource.getRepository(InternalNotification).extend(customInternalNotificationRepository);
      },
    },
    EventsGateway,
    JwtService,
  ],
})
export class InternalNotificationModule {}
