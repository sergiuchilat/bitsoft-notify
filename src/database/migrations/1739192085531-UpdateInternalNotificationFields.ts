import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class UpdateInternalNotificationFields1739192085531 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get existing indexes
    const table = await queryRunner.getTable('internal_notifications');
    const senderUuidIndex = table?.indices.find(index => index.columnNames.includes('sender_uuid'));

    // Drop the unique index only if it exists
    if (senderUuidIndex) {
      await queryRunner.dropIndex('internal_notifications', senderUuidIndex.name);
    }

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
      'internal_notifications',
      new TableIndex({
        name: 'IDX_INTERNAL_NOTIFICATIONS_SENDER_UUID',
        columnNames: ['sender_uuid'],
        isUnique: true
      })
    );
  }
}
