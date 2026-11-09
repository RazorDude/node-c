import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdditionalUsersNoAccessChecks1779746793020
  implements MigrationInterface
{
  name = 'AdditionalUsersNoAccessChecks1779746793020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // a role with a permission for a different module - for the "no access to the module" checks
    await queryRunner.query(
      "INSERT INTO `roles` (`id`, `isActive`, `isEditable`, `name`) VALUES (3, 1, 1, 'OtherModuleUser');"
    );
    await queryRunner.query(
      'INSERT INTO `permissions` (`id`, `allowedInputData`, `forbiddenInputData`, `inputDataFieldName`, `moduleName`, `name`, `requiredStaticData`, `resourceContext`, `resources`, `userFieldName`) VALUES ' +
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [
        10,
        null,
        null,
        null,
        'otherModule',
        'OtherModuleFindCourses',
        null,
        'CoursePlatformCoursesEntityController',
        '["find"]',
        null
      ]
    );
    await queryRunner.query(
      'INSERT INTO `rolePermissions` (`roleId`, `permissionId`) VALUES (3, 10);'
    );
    // user 3 only has the role for the different module
    await queryRunner.query(
      'UPDATE `userAssignedRoles` SET `roleId` = 3 WHERE `userId` = 5;'
    );
    // user 1 has no assigned courses - for the "missing user field" checks of the non-free courses permissions
    await queryRunner.query(
      'DELETE FROM `userAssignedCourses` WHERE `userId` = 3;'
    );
    // user 0 also gets course 4, which isn't deleted by the earlier test suites (unlike course 1)
    await queryRunner.query(
      'INSERT INTO `userAssignedCourses` (`courseId`, `userId`) VALUES (4, 2);'
    );
    // a permission with forbidden input data for the non-admin users, which only applies to courses with courseTypeId 3;
    // since the permissions are checked by id, it's only reached when the free and non-free courses ones don't apply
    await queryRunner.query(
      'INSERT INTO `permissions` (`id`, `allowedInputData`, `forbiddenInputData`, `inputDataFieldName`, `moduleName`, `name`, `requiredStaticData`, `resourceContext`, `resources`, `userFieldName`) VALUES ' +
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [
        11,
        null,
        '{ "query.include": "/category/" }',
        null,
        'coursePlatform',
        'NonAdminFindPremiumCoursesWithoutCategory',
        '{ "inputData.query.filters.courseTypeId": 3 }',
        'CoursePlatformCoursesEntityController',
        '["find"]',
        null
      ]
    );
    await queryRunner.query(
      'INSERT INTO `rolePermissions` (`roleId`, `permissionId`) VALUES (2, 11);'
    );
  }

  // biome-ignore lint/suspicious/noEmptyBlockStatements: Personal preference.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
