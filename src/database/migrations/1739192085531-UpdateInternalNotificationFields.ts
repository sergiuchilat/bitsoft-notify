import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class UpdateInternalNotificationFields1739192085531 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique constraint
    await queryRunner.dropIndex('internal_notifications', 'UQ_ca86bfecee35a80772d28128e53');

    // Alter the column without uniqueness
    await queryRunner.changeColumn(
      'internal_notifications',
      'sender_uuid',
      new TableColumn({
        name: 'sender_uuid',
        type: 'varchar',
        length: '36',
        isNullable: true // Keep nullable if necessary
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Alter column back to unique
    await queryRunner.changeColumn(
      'internal_notifications',
      'sender_uuid',
      new TableColumn({
        name: 'sender_uuid',
        type: 'varchar',
        length: '36',
        isNullable: true // Keep nullable if needed
      })
    );

    // Re-add the unique constraint
    await queryRunner.createIndex(
      'UQ_ca86bfecee35a80772d28128e53',
      new TableIndex({
        name: 'IDX_INTERNAL_NOTIFICATIONS_SENDER_UUID',
        columnNames: ['sender_uuid'],
        isUnique: true
      })
    );
  }
}
