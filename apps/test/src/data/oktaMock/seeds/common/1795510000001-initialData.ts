import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialData1795510000001 implements MigrationInterface {
  name = 'InitialData1795510000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO "users" ("email", "name") VALUES (?, ?), (?, ?);',
      ['admin@node-c.com', 'Admin User', 'user0@node-c.com', 'User Zero']
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "users";');
  }
}
