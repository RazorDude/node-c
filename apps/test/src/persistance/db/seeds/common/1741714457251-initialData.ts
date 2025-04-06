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
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [
        // first item
        1,
        '{ "query.include": ["/lessons(\\\\.lessonType)?/", "courseType"] }',
        '["CoursePlatformCoursesEntityController"]',
        null,
        '["find"]',
        null,
        '["coursePlatform"]',
        'NonAdminFindFreeCourses',
        '{ "inputData.query.filters.courseTypeId": 1 }',
        null,
        // second item
        2,
        '{ "query.include": ["/lessons(\\\\.lessonType)?/", "courseType"] }',
        '["CoursePlatformCoursesEntityController"]',
        null,
        '["findOne"]',
        null,
        '["coursePlatform"]',
        'NonAdminFindOneFreeCourse',
        '{ "inputData.query.filters.courseTypeId": 1 }',
        null,
        // third item
        3,
        '{ \"query.include\": [\"/lessons(\\\\.lessonType)?/\", \"courseType\"] }',
        '["CoursePlatformCoursesEntityController"]',
        null,
        '["find"]',
        'query.filters.id',
        '["coursePlatform"]',
        'NonAdminFindNonFreeCourses',
        null,
        'assignedCourses.id',
        // fourth item
        4,
        '{ \"query.include\": [\"/lessons(\\\\.lessonType)?/\", \"courseType\"] }',
        '["CoursePlatformCoursesEntityController"]',
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
        '["CoursePlatformCoursesEntityController"]',
        null,
        '["bulkCreate", "count", "create", "delete", "find", "findOne", "update"]',
        null,
        '["coursePlatform"]',
        'AdminManageCourses',
        null,
        null,
        // sixth item
        6,
        null,
        '["CoursePlatformUsersEntityController"]',
        null,
        '["bulkCreate", "count", "create", "delete", "find", "findOne", "update"]',
        null,
        '["coursePlatform"]',
        'AdminManageUsers',
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
        // AdminPassword
        "(1, 1, 'admin@node-c.com', 'Node-C', 1, 1, 'Admin', 0, '3348a06a74c38793f89e239e4bd9f4fd39429be99bde7de7269776a22453bb3d', null, null), " +
        // User0Password
        "(2, 1, 'user0@node-c.com', 'User', 1, 1, 'Zero', 0, '3f6cdef9ab48a3765550fb4825d047aa1964b73ab37ff95eeff8842abc43fb91', null, null), " +
        // User1Password
        "(3, 1, 'user1@node-c.com', 'User', 1, 0, 'One', 0, 'f6ae69dd063e73f3b32220dc45d421840ef2768588d1f9beda5ed572829f66b3', null, null), " +
        // User2Password
        "(4, 2, 'user2@node-c.com', 'User', 1, 1, 'Two', 0, '6c596ce68919bf241e2ffe1b21fc7b4097f2b9a720935760ca746bcd295f34cb', null, null), " +
        // User3Password
        "(5, 1, 'user3@node-c.com', 'User', 1, 1, 'Three', 0, '5e96c512cf6a5774d8adb514c5f99fb8e4aefc3d297cc6aaf6f0e40d21b46aae', null, null);"
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
        '(1, 6), ' +
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
