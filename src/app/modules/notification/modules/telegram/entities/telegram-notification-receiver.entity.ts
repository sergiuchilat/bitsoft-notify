import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Language } from '@/app/enum/language.enum';
import { TelegramNotification } from '@/app/modules/notification/modules/telegram/entities/telegram-notification.entity';

@Entity({
  name: 'telegram_notification_receivers',
})
export class TelegramNotificationReceiver {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    length: 36,
    unique: true,
    nullable: false,
  })
    receiver_uuid: string;

  @Column({
    unique: true,
    nullable: true,
  })
    chat_id: number;

  @Column({
    nullable: false,
  })
    language: Language;

  @Column({
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
    callback_url_subscribed_success: string;

  @Column({
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
    callback_url_subscribed_error: string;

  @Column({
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
    callback_url_unsubscribe: string;
  
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
    created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
    confirmed_at: Date;

  @OneToMany(() => TelegramNotification, (notification) => notification.receiver)
    notifications: TelegramNotification[];
}
