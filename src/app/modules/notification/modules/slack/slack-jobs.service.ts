import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { SlackNotificationEntity } from '@/app/modules/notification/modules/slack/entities/slack-notification.entity';

@Injectable()
export class SlackJobsService {
  constructor(
    @InjectRepository(SlackNotificationEntity)
    private readonly slackNotificationRepository: Repository<SlackNotificationEntity>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteOldNotifications() {
    await this.slackNotificationRepository.delete({
      sent_at: LessThan(dayjs().subtract(7, 'days').toDate()),
    });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async deleteOldUnsentNotifications() {
    await this.slackNotificationRepository.delete({
      sent_at: IsNull(),
      created_at: LessThan(dayjs().subtract(30, 'days').toDate()),
    });
  }
}
