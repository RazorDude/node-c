import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnchoredAllowedIncludePatterns1779746793021
  implements MigrationInterface
{
  name = 'AnchoredAllowedIncludePatterns1779746793021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // the patterns are tested with RegExp.test, so without anchors, any include containing "lessons" would match
    // (e.g. lessons.courses)
    await queryRunner.query(
      'UPDATE `permissions` SET `allowedInputData` = ? WHERE `id` IN (1, 2, 3, 4);',
      [
        '{ "query.include": ["/^lessons(\\\\.lessonType)?$/", "courseType"] }'
      ]
    );
    await queryRunner.query(
      "UPDATE `permissions` SET `inputDataFieldName` = 'params.id' WHERE `id` = 4;"
    );
  }

  // oxlint-disable-next-line eslint/no-empty -- Personal preference.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
