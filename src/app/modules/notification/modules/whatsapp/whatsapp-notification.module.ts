import { Module } from '@nestjs/common';
import { WhatsappNotificationController } from '@/app/modules/notification/modules/whatsapp/controllers/whatsapp-notification.controller';
import { WhatsappNotificationService } from '@/app/modules/notification/modules/whatsapp/services/whatsapp-notification.service';

@Module({
  controllers: [WhatsappNotificationController],
  providers: [WhatsappNotificationService],
  exports: [WhatsappNotificationService],
})
export class WhatsappNotificationModule {}
