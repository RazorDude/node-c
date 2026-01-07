import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApForProcessingOutputDataData1767547007700 implements MigrationInterface {
  name = 'ApForProcessingOutputDataData1767547007700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `authorizationPoints` SET `allowedOutputData` = \'{"result.items.createdAt": "/[0-9-.:TZ]/", "result.items.deletedAt": "/[0-9-.:TZ]/"}\' where `id` = 1;'
    );
    await queryRunner.query(
      'UPDATE `authorizationPoints` SET `forbiddenOutputData` = \'{"result.accountStatus.createdAt": "/createdAt/"}\' where `id` = 2;'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
