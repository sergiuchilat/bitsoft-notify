import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('slack_notifications')
export class SlackNotificationEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    length: 255,
  })
  subject: string;

  @Column({
    length: 1_000,
  })
  body: string;

  @Column({
    length: 255,
  })
  receiver_id: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  sent_at?: Date;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
