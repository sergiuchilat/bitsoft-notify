import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnnecessaryUniqueFieldsFromInterrnalNotTransaltions1739795192489 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE internal_notification_translations DROP CONSTRAINT "UQ_fa336911ff36b53346d5f3e4ae8"`,
    );
    await queryRunner.query(
      `ALTER TABLE internal_notification_translations DROP CONSTRAINT "UQ_4dfb3ea29f948b46ab46e26a9ae"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE internal_notification_translations ADD CONSTRAINT "UQ_ce5ea0b81669df3d454229f55e8" UNIQUE("subject")`,
    );

    await queryRunner.query(
      `ALTER TABLE internal_notification_translations ADD CONSTRAINT "UQ_4dfb3ea29f948b46ab46e26a9ae" UNIQUE("body")`,
    );
  }
}
