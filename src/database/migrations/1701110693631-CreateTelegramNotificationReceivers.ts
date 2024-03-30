import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { Language } from '@/app/enum/language.enum';

export class CreateTelegramNotificationReceivers1701110693631 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'telegram_notification_receivers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'receiver_uuid',
            type: 'varchar',
            length: '36',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'chat_id',
            type: 'int',
            isNullable: true
          },
          {
            name: 'language',
            type: 'enum',
            enum: [Language.en, Language.ro, Language.ru, Language.pl],
            isNullable: false,
          },
          {
            name: 'callback_url_subscribed_success',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'callback_url_subscribed_error',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'callback_url_unsubscribe',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'confirmed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('telegram_notification_receivers');
  }
}
