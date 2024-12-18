import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMigrations1734518620061 implements MigrationInterface {
  name = 'FixMigrations1734518620061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "internal_notification_translations" ADD CONSTRAINT "UQ_fa336911ff36b53346d5f3e4ae8" UNIQUE ("subject")',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notification_translations" ADD CONSTRAINT "UQ_4dfb3ea29f948b46ab46e26a9ae" UNIQUE ("body")',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notifications" ADD CONSTRAINT "UQ_a694d7a8ee25924263f9d47d02d" UNIQUE ("uuid")',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notifications" ADD CONSTRAINT "UQ_ca86bfecee35a80772d28128e53" UNIQUE ("sender_uuid")',
    );
    await queryRunner.query('ALTER TABLE "internal_notifications" ALTER COLUMN "created_at" SET NOT NULL');
    await queryRunner.query(
      'ALTER TABLE "internal_notifications" ALTER COLUMN "created_at" SET DEFAULT (\'now\'::text)::timestamp(6) with time zone',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notification_receivers" ADD CONSTRAINT "UQ_ce5ea0b81669df3d454229f55e8" UNIQUE ("receiver_uuid")',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notification_receivers" ALTER COLUMN "sent_at" DROP NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notification_receivers" ALTER COLUMN "sent_at" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "discord_notifications" ALTER COLUMN "created_at" SET DEFAULT (\'now\'::text)::timestamp(6) with time zone',
    );
    await queryRunner.query(
      'ALTER TABLE "telegram_notifications" ALTER COLUMN "created_at" SET DEFAULT (\'now\'::text)::timestamp(6) with time zone',
    );
    await queryRunner.query(
      'ALTER TABLE "telegram_notification_receivers" ADD CONSTRAINT "UQ_05bf528d480426b46671656a02c" UNIQUE ("chat_id")',
    );
    await queryRunner.query(
      'ALTER TABLE "telegram_notification_receivers" ALTER COLUMN "created_at" SET DEFAULT (\'now\'::text)::timestamp(6) with time zone',
    );
    await queryRunner.query(
      'ALTER TABLE "mail_notifications" ALTER COLUMN "created_at" SET DEFAULT (\'now\'::text)::timestamp(6) with time zone',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "mail_notifications" ALTER COLUMN "created_at" DROP DEFAULT');
    await queryRunner.query(
      'ALTER TABLE "telegram_notification_receivers" ALTER COLUMN "created_at" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "telegram_notification_receivers" DROP CONSTRAINT "UQ_05bf528d480426b46671656a02c"',
    );
    await queryRunner.query('ALTER TABLE "telegram_notifications" ALTER COLUMN "created_at" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "discord_notifications" ALTER COLUMN "created_at" DROP DEFAULT');
    await queryRunner.query(
      'ALTER TABLE "internal_notification_receivers" ALTER COLUMN "sent_at" SET DEFAULT (\'now\'::text)::timestamp(6) with time zone',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notification_receivers" ALTER COLUMN "sent_at" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notification_receivers" DROP CONSTRAINT "UQ_ce5ea0b81669df3d454229f55e8"',
    );
    await queryRunner.query('ALTER TABLE "internal_notifications" ALTER COLUMN "created_at" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "internal_notifications" ALTER COLUMN "created_at" DROP NOT NULL');
    await queryRunner.query(
      'ALTER TABLE "internal_notifications" DROP CONSTRAINT "UQ_ca86bfecee35a80772d28128e53"',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notifications" DROP CONSTRAINT "UQ_a694d7a8ee25924263f9d47d02d"',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notification_translations" DROP CONSTRAINT "UQ_4dfb3ea29f948b46ab46e26a9ae"',
    );
    await queryRunner.query(
      'ALTER TABLE "internal_notification_translations" DROP CONSTRAINT "UQ_fa336911ff36b53346d5f3e4ae8"',
    );
  }
}
