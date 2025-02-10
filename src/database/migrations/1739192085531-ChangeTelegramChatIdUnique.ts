import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

export class  ChangeTelegramChatIdUnique1739192085531 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'telegram_notification_receivers',
            'chat_id',
            new TableColumn({
                name: 'chat_id',
                type: 'varchar',
                isUnique: false,
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
                isUnique: true,
                type: 'varchar',
                isNullable: true,
            }),
        );
    }

}
