import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { Language } from '@/app/enum/language.enum';

export class CreateTableNotificationTranslations1664539696232 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'internal_notification_translations',
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
            name: 'notification_id',
            type: 'int',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'language',
            type: 'enum',
            enum: Object.values(Language),
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
            type: 'varchar',
            length: '1000',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'internal_notification_translations',
      new TableForeignKey({
        name: 'internal_notification_translation_fk',
        columnNames: ['notification_id'],
        referencedTableName: 'internal_notifications',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('internal_notification_translations');
    await queryRunner.dropForeignKey(
      'internal_notification_translations',
      'internal_notification_translation_fk',
    );
  }
}
