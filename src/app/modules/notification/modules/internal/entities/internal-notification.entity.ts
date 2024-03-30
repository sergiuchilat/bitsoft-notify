import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InternalNotificationTranslation } from '@/app/modules/notification/modules/internal/entities/internal-notification-translation.entity';
import { InternalNotificationReceiver } from '@/app/modules/notification/modules/internal/entities/internal-notification-receiver.entity';

@Entity({
  name: 'internal_notifications',
})
export class InternalNotification {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    length: 36,
    unique: true,
    nullable: false,
  })
    uuid: string;

  @Column({
    length: 36,
    unique: true,
    nullable: false,
  })
    sender_uuid: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @OneToMany(() => InternalNotificationTranslation, (translation) => translation.notification)
    translations: InternalNotificationTranslation[];

  @OneToMany(() => InternalNotificationReceiver, (receiver) => receiver.notification)
    receivers: InternalNotificationReceiver[];
}
