import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Language } from '@/app/enum/language.enum';
import { InternalNotification } from '@/app/modules/notification/modules/internal/entities/internal-notification.entity';

@Entity({
  name: 'internal_notification_translations',
})
export class InternalNotificationTranslation {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    type: 'int',
    nullable: false,
  })
    notification_id: number;

  @Column({
    nullable: false,
  })
    language: Language;

  @Column({
    length: 250,
    unique: true,
    nullable: false,
  })
    subject: string;

  @Column({
    length: 1000,
    unique: true,
    nullable: false,
  })
    body: string;

  @ManyToOne(() => InternalNotification, (notification) => notification.translations)
  @JoinColumn({ name: 'notification_id' })
    notification: InternalNotification;
}
