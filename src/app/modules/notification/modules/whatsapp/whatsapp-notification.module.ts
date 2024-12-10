import { Module } from '@nestjs/common';
import { WhatsappNotificationController } from '@/app/modules/notification/modules/whatsapp/controllers/whatsapp-notification.controller';
import { WhatsappNotificationService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappNotificationEntity } from '@/app/modules/notification/modules/whatsapp/entities/whatsapp-notification.entity';
import { WhatsappJobsService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-jobs.service';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsappNotificationEntity])],
  controllers: [WhatsappNotificationController],
  providers: [WhatsappNotificationService, WhatsappJobsService],
  exports: [WhatsappNotificationService],
})
export class WhatsappNotificationModule {}
