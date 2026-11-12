import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApForProcessingOutputDataData1767547007700
  implements MigrationInterface
{
  name = 'ApForProcessingOutputDataData1767547007700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `authorizationPoints` SET `allowedOutputData` = \'{"result.items.createdAt": "/[0-9-.:TZ]/", "result.items.deletedAt": "/[0-9-.:TZ]/"}\' where `id` = 1;'
    );
    await queryRunner.query(
      'UPDATE `authorizationPoints` SET `forbiddenOutputData` = \'{"result.courseType.createdAt": "/[0-9]/"}\' where `id` = 2;'
    );
  }

  // oxlint-disable-next-line eslint/no-empty -- Personal preference.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
