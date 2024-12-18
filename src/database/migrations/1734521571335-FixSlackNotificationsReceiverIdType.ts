import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSlackNotificationsReceiverIdType1734521571335 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "slack_notifications" ALTER COLUMN "receiver_id" TYPE varchar');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "slack_notifications"
      ALTER COLUMN "receiver_id" TYPE integer USING "receiver_id"::integer;
    `);
  }
}
