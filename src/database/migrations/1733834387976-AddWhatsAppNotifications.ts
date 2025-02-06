import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddWhatsAppNotifications1733834387976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'whatsapp_notifications',
        columns: [
          {
            isPrimary: true,
            isGenerated: true,
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'body',
            type: 'varchar',
            length: '1000',
          },
          {
            name: 'receiver_id',
            type: 'int',
          },
          {
            name: 'sent_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('whatsapp_notifications');
  }
}
