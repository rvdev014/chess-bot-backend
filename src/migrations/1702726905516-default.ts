import { MigrationInterface, QueryRunner } from "typeorm"

export class Default1702726905516 implements MigrationInterface {
    name = 'Default1702726905516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying, "avatar" character varying, "language" character varying(2) NOT NULL DEFAULT 'ru', "referral" character varying, "gender" character varying(1), "active" boolean NOT NULL DEFAULT true, "age" integer NOT NULL DEFAULT '0', "socketId" character varying, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`)
        await queryRunner.query(`CREATE TABLE "games" ("id" SERIAL NOT NULL, "whitePlayerId" integer NOT NULL, "blackPlayerId" integer NOT NULL, "winnerId" integer NOT NULL, "lastFen" character varying NOT NULL, "firstPlayerId" integer, "secondPlayerId" integer, CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`)
        await queryRunner.query(`CREATE TABLE "queues" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_d966f9eb39a9396658387071bb3" PRIMARY KEY ("id"))`)
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_8abad5fb430218ef8af88a034f2" FOREIGN KEY ("firstPlayerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_c2c349d15f2ae8e0aae83f044d1" FOREIGN KEY ("secondPlayerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_e528275f53e8f4a97f1b2e7dfb8" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE "queues" ADD CONSTRAINT "FK_a39f706dc5095c58b568ed55e65" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queues" DROP CONSTRAINT "FK_a39f706dc5095c58b568ed55e65"`)
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_e528275f53e8f4a97f1b2e7dfb8"`)
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_c2c349d15f2ae8e0aae83f044d1"`)
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_8abad5fb430218ef8af88a034f2"`)
        await queryRunner.query(`DROP TABLE "queues"`)
        await queryRunner.query(`DROP TABLE "games"`)
        await queryRunner.query(`DROP TABLE "users"`)
    }

}
