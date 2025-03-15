import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1741647485413 implements MigrationInterface {
  name = 'Initial1741647485413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `accessControlPoints` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `allowedInputData` json NULL, `controllerNames` json NULL, `forbiddenInputData` json NULL, `handlerNames` json NULL, `inputDataFieldName` varchar(255) NULL, `moduleNames` json NULL, `name` varchar(255) NOT NULL, `requiredStaticData` json NULL, `userFieldName` varchar(255) NULL, UNIQUE INDEX `IDX_bb43ed6a75a6c094375132f655` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `courses` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `courseTypeId` int NOT NULL, `name` varchar(255) NOT NULL, UNIQUE INDEX `COURSES_UNIQUE_IDX_0` (`courseTypeId`, `name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `courseTypes` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `isActive` tinyint NOT NULL DEFAULT 1, `name` varchar(255) NOT NULL, UNIQUE INDEX `IDX_3103972501d48d64f05163ab26` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `lessons` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `lessonTypeId` int NOT NULL, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `lessonTypes` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `isActive` tinyint NOT NULL DEFAULT 1, `name` varchar(255) NOT NULL, UNIQUE INDEX `IDX_d22b9a22a475e61f014c085f0e` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `userAccountStatuses` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `label` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `userLoginAllowed` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX `IDX_7131e5aae25e83355d2cb3c298` (`label`), UNIQUE INDEX `IDX_f3854ea6fa59e2075336931580` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `users` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `accountStatusId` int NOT NULL, `email` varchar(255) NOT NULL, `firstName` varchar(255) NOT NULL, `hasTakenIntro` tinyint NOT NULL DEFAULT 0, `isVerified` tinyint NOT NULL DEFAULT 0, `lastName` varchar(255) NOT NULL, `mfaIsEnabled` tinyint NOT NULL DEFAULT 0, `password` varchar(255) NULL, `phoneNumber` varchar(255) NULL, `profileImageKey` varchar(255) NULL, UNIQUE INDEX `USERS_UNIQUE_IDX_0` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `userTypes` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `isActive` tinyint NOT NULL DEFAULT 1, `isEditable` tinyint NOT NULL DEFAULT 1, `name` varchar(255) NOT NULL, UNIQUE INDEX `IDX_c3d9e1af185bc4387f0a51e777` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `courseLessons` (`courseId` int NOT NULL, `lessonId` int NOT NULL, INDEX `IDX_5db8e75063474458807838819e` (`courseId`), INDEX `IDX_149ea91b73c9da38941aefe586` (`lessonId`), PRIMARY KEY (`courseId`, `lessonId`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `userAssignedCourses` (`courseId` int NOT NULL, `userId` int NOT NULL, INDEX `IDX_a61b2044f9865e6f7dca2429bc` (`courseId`), INDEX `IDX_d6c37197a7453e42373c0a143b` (`userId`), PRIMARY KEY (`courseId`, `userId`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `userTypeAccessControlPoints` (`userTypeId` int NOT NULL, `accessControlPointId` int NOT NULL, INDEX `IDX_6a440eb6859bd3ac63df1061e6` (`userTypeId`), INDEX `IDX_83510678c89098a99135feaa16` (`accessControlPointId`), PRIMARY KEY (`userTypeId`, `accessControlPointId`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'CREATE TABLE `userTypeAssignedUsers` (`userTypeId` int NOT NULL, `userId` int NOT NULL, INDEX `IDX_1bc7728887ce7726fa46a7ea41` (`userTypeId`), INDEX `IDX_edf51db2850541f497e44dc035` (`userId`), PRIMARY KEY (`userTypeId`, `userId`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'ALTER TABLE `courses` ADD CONSTRAINT `FK_7d0effe56712c9f8d73b99f319c` FOREIGN KEY (`courseTypeId`) REFERENCES `courseTypes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `lessons` ADD CONSTRAINT `FK_fc317529fc0a96ef87f8156ac98` FOREIGN KEY (`lessonTypeId`) REFERENCES `lessonTypes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD CONSTRAINT `FK_10b181b59cf33228a297b21dbb2` FOREIGN KEY (`accountStatusId`) REFERENCES `userAccountStatuses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `courseLessons` ADD CONSTRAINT `FK_5db8e75063474458807838819ee` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE `courseLessons` ADD CONSTRAINT `FK_149ea91b73c9da38941aefe5863` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `userAssignedCourses` ADD CONSTRAINT `FK_a61b2044f9865e6f7dca2429bc1` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE `userAssignedCourses` ADD CONSTRAINT `FK_d6c37197a7453e42373c0a143b8` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAccessControlPoints` ADD CONSTRAINT `FK_6a440eb6859bd3ac63df1061e64` FOREIGN KEY (`userTypeId`) REFERENCES `userTypes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAccessControlPoints` ADD CONSTRAINT `FK_83510678c89098a99135feaa161` FOREIGN KEY (`accessControlPointId`) REFERENCES `accessControlPoints`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAssignedUsers` ADD CONSTRAINT `FK_1bc7728887ce7726fa46a7ea415` FOREIGN KEY (`userTypeId`) REFERENCES `userTypes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAssignedUsers` ADD CONSTRAINT `FK_edf51db2850541f497e44dc0350` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `userTypeAssignedUsers` DROP FOREIGN KEY `FK_edf51db2850541f497e44dc0350`');
    await queryRunner.query('ALTER TABLE `userTypeAssignedUsers` DROP FOREIGN KEY `FK_1bc7728887ce7726fa46a7ea415`');
    await queryRunner.query(
      'ALTER TABLE `userTypeAccessControlPoints` DROP FOREIGN KEY `FK_83510678c89098a99135feaa161`'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAccessControlPoints` DROP FOREIGN KEY `FK_6a440eb6859bd3ac63df1061e64`'
    );
    await queryRunner.query('ALTER TABLE `userAssignedCourses` DROP FOREIGN KEY `FK_d6c37197a7453e42373c0a143b8`');
    await queryRunner.query('ALTER TABLE `userAssignedCourses` DROP FOREIGN KEY `FK_a61b2044f9865e6f7dca2429bc1`');
    await queryRunner.query('ALTER TABLE `courseLessons` DROP FOREIGN KEY `FK_149ea91b73c9da38941aefe5863`');
    await queryRunner.query('ALTER TABLE `courseLessons` DROP FOREIGN KEY `FK_5db8e75063474458807838819ee`');
    await queryRunner.query('ALTER TABLE `users` DROP FOREIGN KEY `FK_10b181b59cf33228a297b21dbb2`');
    await queryRunner.query('ALTER TABLE `lessons` DROP FOREIGN KEY `FK_fc317529fc0a96ef87f8156ac98`');
    await queryRunner.query('ALTER TABLE `courses` DROP FOREIGN KEY `FK_7d0effe56712c9f8d73b99f319c`');
    await queryRunner.query('DROP INDEX `IDX_edf51db2850541f497e44dc035` ON `userTypeAssignedUsers`');
    await queryRunner.query('DROP INDEX `IDX_1bc7728887ce7726fa46a7ea41` ON `userTypeAssignedUsers`');
    await queryRunner.query('DROP TABLE `userTypeAssignedUsers`');
    await queryRunner.query('DROP INDEX `IDX_83510678c89098a99135feaa16` ON `userTypeAccessControlPoints`');
    await queryRunner.query('DROP INDEX `IDX_6a440eb6859bd3ac63df1061e6` ON `userTypeAccessControlPoints`');
    await queryRunner.query('DROP TABLE `userTypeAccessControlPoints`');
    await queryRunner.query('DROP INDEX `IDX_d6c37197a7453e42373c0a143b` ON `userAssignedCourses`');
    await queryRunner.query('DROP INDEX `IDX_a61b2044f9865e6f7dca2429bc` ON `userAssignedCourses`');
    await queryRunner.query('DROP TABLE `userAssignedCourses`');
    await queryRunner.query('DROP INDEX `IDX_149ea91b73c9da38941aefe586` ON `courseLessons`');
    await queryRunner.query('DROP INDEX `IDX_5db8e75063474458807838819e` ON `courseLessons`');
    await queryRunner.query('DROP TABLE `courseLessons`');
    await queryRunner.query('DROP INDEX `IDX_c3d9e1af185bc4387f0a51e777` ON `userTypes`');
    await queryRunner.query('DROP TABLE `userTypes`');
    await queryRunner.query('DROP INDEX `USERS_UNIQUE_IDX_0` ON `users`');
    await queryRunner.query('DROP TABLE `users`');
    await queryRunner.query('DROP INDEX `IDX_f3854ea6fa59e2075336931580` ON `userAccountStatuses`');
    await queryRunner.query('DROP INDEX `IDX_7131e5aae25e83355d2cb3c298` ON `userAccountStatuses`');
    await queryRunner.query('DROP TABLE `userAccountStatuses`');
    await queryRunner.query('DROP INDEX `IDX_d22b9a22a475e61f014c085f0e` ON `lessonTypes`');
    await queryRunner.query('DROP TABLE `lessonTypes`');
    await queryRunner.query('DROP TABLE `lessons`');
    await queryRunner.query('DROP INDEX `IDX_3103972501d48d64f05163ab26` ON `courseTypes`');
    await queryRunner.query('DROP TABLE `courseTypes`');
    await queryRunner.query('DROP INDEX `COURSES_UNIQUE_IDX_0` ON `courses`');
    await queryRunner.query('DROP TABLE `courses`');
    await queryRunner.query('DROP INDEX `IDX_bb43ed6a75a6c094375132f655` ON `accessControlPoints`');
    await queryRunner.query('DROP TABLE `accessControlPoints`');
  }
}
