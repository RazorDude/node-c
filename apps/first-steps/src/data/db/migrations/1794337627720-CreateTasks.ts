import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasks1794337627720 implements MigrationInterface {
  name = 'CreateTasks1794337627720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tasks" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "done" boolean NOT NULL DEFAULT (0), "title" varchar NOT NULL)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
