import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApForProcessingOutputData1767547007695 implements MigrationInterface {
  name = 'ApForProcessingOutputData1767547007695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authorizationPoints` ADD `allowedOutputData` json NULL');
    await queryRunner.query('ALTER TABLE `authorizationPoints` ADD `forbiddenOutputData` json NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `authorizationPoints` DROP COLUMN `forbiddenOutputData`');
    await queryRunner.query('ALTER TABLE `authorizationPoints` DROP COLUMN `allowedOutputData`');
  }
}
