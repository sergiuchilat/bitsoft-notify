import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('telegram_notifications_test_callback')
class TelegramNotificationTestCallbackEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    nullable: false,
  })
    payload: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
    created_at: Date;
}