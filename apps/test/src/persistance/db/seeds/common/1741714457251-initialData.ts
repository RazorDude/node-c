import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialData1741714457251 implements MigrationInterface {
  name = 'InitialData1741714457251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `authorizationPoints` (`id`, `allowedInputData`, `controllerNames`, `forbiddenInputData`, `handlerNames`, `inputDataFieldName`, `moduleNames`, `name`, `requiredStaticData`, `userFieldName`) VALUES ' +
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [
        // first item
        1,
        '{ "inputData.query.include": ["/lessons(\\\\.type)?/", "type"] }',
        '["courses"]',
        null,
        '["find"]',
        null,
        '["coursePlatform"]',
        'NonAdminFindFreeCourses',
        '{ "inputData.query.filters.typeId": 1 }',
        null,
        // second item
        2,
        '{ "inputData.query.include": ["/lessons(\\\\.type)?/", "type"] }',
        '["courses"]',
        null,
        '["findOne"]',
        null,
        '["coursePlatform"]',
        'NonAdminFindOneFreeCourse',
        '{ "inputData.query.filters.typeId": 1 }',
        null,
        // third item
        3,
        '{ \"inputData.query.include\": [\"/lessons(\\\\.type)?/\", \"type\"] }',
        '["courses"]',
        null,
        '["find"]',
        'query.filters.id',
        '["coursePlatform"]',
        'NonAdminFindNonFreeCourses',
        null,
        'assignedCourses.id',
        // fourth item
        4,
        '{ \"inputData.query.include\": [\"/lessons(\\\\.type)?/\", \"type\"] }',
        '["courses"]',
        null,
        '["findOne"]',
        'query.params.id',
        '["coursePlatform"]',
        'NonAdminFindNonFreeCourse',
        null,
        'assignedCourses.id',
        // fifth item
        5,
        null,
        '["courses"]',
        null,
        '["bulkCreate", "count", "create", "delete", "find", "findOne", "update"]',
        null,
        '["coursePlatform"]',
        'AdminManageCourses',
        null,
        null
      ]
    );
    await queryRunner.query(
      'INSERT INTO `courseTypes` (`id`, `isActive`, `name`) VALUES ' +
        "(1, 1, 'Free'), " +
        "(2, 1, 'Members Only')," +
        "(3, 0, 'Premium Members');"
    );
    await queryRunner.query(
      'INSERT INTO `courses` (`id`, `courseTypeId`, `name`) VALUES ' +
        "(1, 1, 'Cooking: Beginners'), " +
        "(2, 1, 'Cooking: Intermediate'), " +
        "(3, 2, 'Cooking: Design A Recipe'), " +
        "(4, 3, 'Cooking: A Day In Hell With Gordon Ramsey');"
    );
    await queryRunner.query(
      'INSERT INTO `lessonTypes` (`id`, `isActive`, `name`) VALUES ' +
        "(1, 1, 'Standard'), " +
        "(2, 0, 'Interactive')," +
        "(3, 1, 'Live');"
    );
    await queryRunner.query(
      'INSERT INTO `lessons` (`id`, `lessonTypeId`, `name`) VALUES ' +
        "(1, 1, 'Introduction'), " +
        "(2, 1, 'Heating elements and temperature management'), " +
        "(3, 1, 'Basic ingridients'), " +
        "(4, 1, 'Staple food recipes'), " +
        "(5, 2, 'Multi-stage cooking'), " +
        "(6, 1, 'Advanced ingredients'), " +
        "(7, 3, 'Advanced staple food recipes'), " +
        "(8, 3, 'The secrets of Grandma\'\'s food'), " +
        "(9, 3, 'Introduction to Gordon\'\'s style');"
    );
    await queryRunner.query(
      'INSERT INTO `courseLessons` (`courseId`, `lessonId`) VALUES ' +
        '(1, 1), ' +
        '(1, 2), ' +
        '(1, 3), ' +
        '(1, 4), ' +
        '(2, 5), ' +
        '(2, 6), ' +
        '(3, 7), ' +
        '(3, 8), ' +
        '(4, 9);'
    );
    await queryRunner.query(
      'INSERT INTO `userAccountStatuses` (`id`, `label`, `name`, `userLoginAllowed`) VALUES ' +
        "(1, 'Active', 'active', 1), " +
        "(2, 'Suspended', 'suspended', 0);"
    );
    await queryRunner.query(
      'INSERT INTO `userTypes` (`id`, `isActive`, `isEditable`, `name`) VALUES ' +
        "(1, 1, 0, 'Admin'), " +
        "(2, 1, 1, 'User');"
    );
    await queryRunner.query(
      'INSERT INTO `users` (`id`, `accountStatusId`, `email`, `firstName`, `hasTakenIntro`, `isVerified`, `lastName`, `mfaIsEnabled`, `password`, `phoneNumber`, `profileImageKey`) VALUES ' +
        "(1, 1, 'admin@node-c.com', 'Node-C', 1, 1, 'Admin', 0, 'TestPassword', null, null), " +
        "(2, 1, 'user0@node-c.com', 'User', 1, 1, 'Zero', 0, 'TestPassword', null, null), " +
        "(3, 1, 'user1@node-c.com', 'User', 1, 0, 'One', 0, 'TestPassword', null, null), " +
        "(4, 2, 'user2@node-c.com', 'User', 1, 1, 'Two', 0, 'TestPassword', null, null), " +
        "(5, 1, 'user3@node-c.com', 'User', 1, 1, 'Three', 0, 'TestPassword', null, null);"
    );
    await queryRunner.query(
      'INSERT INTO `userAssignedCourses` (`courseId`, `userId`) VALUES ' +
        '(1, 2), ' +
        '(1, 3), ' +
        '(1, 4), ' +
        '(1, 5), ' +
        '(2, 5), ' +
        '(3, 5), ' +
        '(4, 5);'
    );
    await queryRunner.query(
      'INSERT INTO `userTypeAuthorizationPoints` (`userTypeId`, `authorizationPointId`) VALUES ' +
        '(1, 5), ' +
        '(2, 1), ' +
        '(2, 2), ' +
        '(2, 3), ' +
        '(2, 4);'
    );
    await queryRunner.query(
      'INSERT INTO `userTypeAssignedUsers` (`userTypeId`, `userId`) VALUES ' +
        '(1, 1), ' +
        '(2, 2), ' +
        '(2, 3), ' +
        '(2, 4), ' +
        '(2, 5);'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
