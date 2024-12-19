import { Module } from '@nestjs/common';
import { WhatsappNotificationController } from '@/app/modules/notification/modules/whatsapp/controllers/whatsapp-notification.controller';
import { WhatsappNotificationService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappNotificationEntity } from '@/app/modules/notification/modules/whatsapp/entities/whatsapp-notification.entity';
import { WhatsappJobsService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-jobs.service';
import { WhatsappApiService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsappNotificationEntity])],
  controllers: [WhatsappNotificationController],
  providers: [WhatsappNotificationService, WhatsappApiService, WhatsappJobsService],
  exports: [WhatsappNotificationService, WhatsappApiService],
})
export class WhatsappNotificationModule {}
