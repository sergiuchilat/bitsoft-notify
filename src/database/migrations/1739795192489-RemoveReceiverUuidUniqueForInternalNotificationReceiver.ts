import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveChatIdUniqueForTelegramReceiver1739795192489 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE internal_notification_receivers DROP CONSTRAINT "UQ_ce5ea0b81669df3d454229f55e8"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE internal_notification_receivers ADD CONSTRAINT "UQ_ce5ea0b81669df3d454229f55e8" UNIQUE("receiver_uuid")`,
    );
  }
}
