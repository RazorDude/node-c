import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelationFieldsWithAliases1794340998273
  implements MigrationInterface
{
  name = 'RelationFieldsWithAliases1794340998273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_3103972501d48d64f05163ab26` ON `courseTypes`'
    );
    await queryRunner.query(
      'ALTER TABLE `courseTypes` CHANGE `name` `course_type_name` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `courseTypes` ADD UNIQUE INDEX `IDX_4d23249287503b56ed17f06c26` (`course_type_name`)'
    );
    await queryRunner.query(
      'ALTER TABLE `courseTypes` CHANGE `deletedAt` `deleted_at` datetime(6) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `courseTypes` CHANGE `deleted_at` `deletedAt` datetime(6) NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `courseTypes` DROP INDEX `IDX_4d23249287503b56ed17f06c26`'
    );
    await queryRunner.query(
      'ALTER TABLE `courseTypes` CHANGE `course_type_name` `name` varchar(255) NOT NULL'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `IDX_3103972501d48d64f05163ab26` ON `courseTypes` (`name`)'
    );
  }
}
