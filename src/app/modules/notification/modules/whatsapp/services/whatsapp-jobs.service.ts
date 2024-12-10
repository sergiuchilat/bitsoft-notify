import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IsNull, LessThan, Repository } from 'typeorm';
import dayjs from 'dayjs';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappNotificationEntity } from '@/app/modules/notification/modules/whatsapp/entities/whatsapp-notification.entity';

@Injectable()
export class WhatsappJobsService {
  constructor(
    @InjectRepository(WhatsappNotificationEntity)
    private readonly whatsappNotificationRepository: Repository<WhatsappNotificationEntity>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteOldNotifications() {
    await this.whatsappNotificationRepository.delete({
      sent_at: LessThan(dayjs().subtract(7, 'days').toDate()),
    });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async deleteOldUnsentNotifications() {
    await this.whatsappNotificationRepository.delete({
      sent_at: IsNull(),
      created_at: LessThan(dayjs().subtract(30, 'days').toDate()),
    });
  }
}
