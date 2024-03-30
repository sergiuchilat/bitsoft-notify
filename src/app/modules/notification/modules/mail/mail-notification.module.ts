import { Module } from '@nestjs/common';
import { MailNotificationController } from '@/app/modules/notification/modules/mail/mail-notification.controller';
import { MailNotificationService } from '@/app/modules/notification/modules/mail/mail-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailNotification } from '@/app/modules/notification/modules/mail/entities/mail-notification.entity';
import { ScheduleModule } from '@nestjs/schedule';
import MailerConfig from '@/config/services/mailer-config';

@Module({
  imports: [TypeOrmModule.forFeature([MailNotification]), ScheduleModule.forRoot(), MailerConfig],
  controllers: [MailNotificationController],
  providers: [MailNotificationService],
})
export class MailNotificationModule {}
