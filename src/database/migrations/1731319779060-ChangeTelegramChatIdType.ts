import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

export class  ChangeTelegramChatIdType1731319779060 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'telegram_notification_receivers',
      'chat_id',
      new TableColumn({
        name: 'chat_id',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'telegram_notification_receivers',
      'chat_id',
      new TableColumn({
        name: 'chat_id',
        type: 'int',
        isNullable: true,
      }),
    );
  }

}
