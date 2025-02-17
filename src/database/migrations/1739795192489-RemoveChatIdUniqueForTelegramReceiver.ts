import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveChatIdUniqueForTelegramReceiver1739795192489 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE telegram_notification_receivers DROP CONSTRAINT "UQ_05bf528d480426b46671656a02c"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE telegram_notification_receivers ADD CONSTRAINT "UQ_05bf528d480426b46671656a02c" UNIQUE("chat_id")`,
    );
  }
}
