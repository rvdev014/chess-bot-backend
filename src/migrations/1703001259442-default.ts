import { MigrationInterface, QueryRunner } from "typeorm"

export class Default1703001259442 implements MigrationInterface {
    name = 'Default1703001259442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`)
    }

}
