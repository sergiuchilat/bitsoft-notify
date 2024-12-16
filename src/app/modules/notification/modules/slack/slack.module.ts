import { Module } from '@nestjs/common';
import { SlackController } from '@/app/modules/notification/modules/slack/slack.controller';
import { SlackService } from '@/app/modules/notification/modules/slack/slack.service';
import { SlackApiService } from '@/app/modules/notification/modules/slack/slack-api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackNotificationEntity } from '@/app/modules/notification/modules/slack/entities/slack-notification.entity';
import { HttpModule } from '@nestjs/axios';
import { SlackJobsService } from '@/app/modules/notification/modules/slack/slack-jobs.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([SlackNotificationEntity])],
  controllers: [SlackController],
  providers: [SlackService, SlackApiService, SlackJobsService],
  exports: [SlackService, SlackApiService],
})
export class SlackModule {}
