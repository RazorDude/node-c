import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1795510000000 implements MigrationInterface {
  name = 'Initial1795510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "users" ("email" varchar NOT NULL, "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, CONSTRAINT "USERS_UNIQUE_IDX_0" UNIQUE ("email"))'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
