import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { Language } from '@/app/enum/language.enum';

export class CreateTelegramNotifications1701110693633 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'telegram_notifications',
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
            name: 'receiver_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'body',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'language',
            type: 'enum',
            enum: Object.values(Language),
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'retry_attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'viewed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'telegram_notifications',
      new TableForeignKey({
        name: 'telegram_notification_receivers',
        columnNames: ['receiver_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'telegram_notification_receivers',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('telegram_notifications');
    await queryRunner.dropForeignKey('telegram_notifications', 'telegram_notification_receivers');
  }
}
