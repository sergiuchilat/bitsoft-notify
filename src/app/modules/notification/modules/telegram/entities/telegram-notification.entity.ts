import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import { Language } from '@/app/enum/language.enum';
import { TelegramNotificationReceiver } from '@/app/modules/notification/modules/telegram/entities/telegram-notification-receiver.entity';

@Entity({
  name: 'telegram_notifications',
})
export class TelegramNotification {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    length: 255,
    nullable: false,
  })
    subject: string;

  @Column({
    nullable: false,
  })
    body: string;

  @Column({
    nullable: false,
  })
    language: Language;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
    created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
    sent_at: Date;

  @Column({
    type: 'int',
    default: 0,
  })
    retry_attempts: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
    viewed_at: Date;

  @Column({
    nullable: false,
  })
    receiver_id: number;

  @ManyToOne(() => TelegramNotificationReceiver, (notificationReceiver) => notificationReceiver.notifications)
  @JoinColumn({ name: 'receiver_id' })
    receiver: TelegramNotificationReceiver;
}
