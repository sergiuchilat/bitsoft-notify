import { Injectable } from '@nestjs/common';
import { MailNotificationCreatePayloadDto } from '@/app/modules/notification/modules/mail/dto/mail-notification-create-payload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { MailNotification } from '@/app/modules/notification/modules/mail/entities/mail-notification.entity';
import { MailerService } from '@nestjs-modules/mailer';
import AppConfig from '@/config/app-config';
import { Language } from '@/app/enum/language.enum';
import { Cron } from '@nestjs/schedule';
import { isEmail } from 'class-validator';

@Injectable()
export class MailNotificationService {
  constructor(
    @InjectRepository(MailNotification)
    private readonly notificationRepository: Repository<MailNotification>,
    private readonly dateSource: DataSource,
    private readonly mailerService: MailerService,
  ) {}

  async createNotification(notification: MailNotificationCreatePayloadDto) {
    const createdNotifications = [];
    const queryRunner = this.dateSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const email of notification.receivers) {
        const newNotification = new MailNotification();
        newNotification.receiver_email = email;
        newNotification.subject = notification.subject;
        newNotification.body = notification.body;
        newNotification.language = notification.language || Language.en;
        createdNotifications.push(await queryRunner.manager.save(newNotification));
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return createdNotifications;
  }

  public async getUnsentNotifications() {
    return this.notificationRepository.find({
      where: {
        sent_at: IsNull(),
        retry_attempts: LessThanOrEqual(AppConfig.mail.retryAttempts),
      },
      order: {
        created_at: 'ASC',
      },
      take: 1,
    });
  }

  public async getSentNotifications() {
    return this.notificationRepository.find({
      where: {
        sent_at: Not(IsNull()),
      },
    });
  }

  @Cron(AppConfig.mail.cronTimeout)
  async sendNotification() {
    //console.log('sendNotification', new Date().toISOString());
    const sentNotifications = [];

    try {
      const notificationsToBeSent = await this.getUnsentNotifications();
      for (const mailNotification of notificationsToBeSent) {
        mailNotification.retry_attempts += 1;

        if (isEmail(mailNotification.receiver_email)) {
          mailNotification.sent_at = new Date();
          const sendResponse = await this.mailerService.sendMail({
            to: mailNotification.receiver_email,
            subject: mailNotification.subject,
            text: mailNotification.body,
            html: mailNotification.body,
          });

          console.log('sendResponse', sendResponse);
        }

        await this.notificationRepository.save(mailNotification);
        sentNotifications.push(mailNotification);
      }
      return sentNotifications;
    } catch (err) {
      console.log(err);
    }
  }
}
