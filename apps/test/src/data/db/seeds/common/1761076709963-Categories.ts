import { MigrationInterface, QueryRunner } from 'typeorm';

export class Categories1761076709963 implements MigrationInterface {
  name = 'Categories1761076709963';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO `category` (`id`, `name`) VALUES (1, 'Default');"
    );
    await queryRunner.query(
      'UPDATE `courses` SET `category_id` = 1 where `id` = 4;'
    );
  }

  // oxlint-disable-next-line eslint/no-empty -- Personal preference.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
