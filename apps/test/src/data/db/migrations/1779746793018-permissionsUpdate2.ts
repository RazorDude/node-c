import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermissionsUpdate21779746793018 implements MigrationInterface {
  name = 'PermissionsUpdate21779746793018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP FOREIGN KEY `FK_cebb41c400fa054c9a650ae5320`');
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP FOREIGN KEY `FK_fb62cc28426e6f6a07bf7c2a0a0`');
    await queryRunner.query('ALTER TABLE `userAssignedRoles` DROP FOREIGN KEY `FK_1bc7728887ce7726fa46a7ea415`');
    await queryRunner.query('ALTER TABLE `userAssignedRoles` DROP FOREIGN KEY `FK_edf51db2850541f497e44dc0350`');
    await queryRunner.query('DROP INDEX `IDX_e29ca7581fdccb478db932853b` ON `permissions`');
    await queryRunner.query('DROP INDEX `IDX_c3d9e1af185bc4387f0a51e777` ON `roles`');
    await queryRunner.query('DROP INDEX `IDX_cebb41c400fa054c9a650ae532` ON `rolePermissions`');
    await queryRunner.query('DROP INDEX `IDX_fb62cc28426e6f6a07bf7c2a0a` ON `rolePermissions`');
    await queryRunner.query('DROP INDEX `IDX_1bc7728887ce7726fa46a7ea41` ON `userAssignedRoles`');
    await queryRunner.query('DROP INDEX `IDX_edf51db2850541f497e44dc035` ON `userAssignedRoles`');
    await queryRunner.query('ALTER TABLE `userAssignedRoles` CHANGE `userTypeId` `roleId` int NOT NULL');
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `rolePermissions` CHANGE `userTypeId` `roleId` int NOT NULL');
    await queryRunner.query('ALTER TABLE `rolePermissions` CHANGE `authorizationPointId` `permissionId` int NOT NULL');
    await queryRunner.query('ALTER TABLE `rolePermissions` ADD PRIMARY KEY (`roleId`, `permissionId`)');
    await queryRunner.query('ALTER TABLE `permissions` ADD UNIQUE INDEX `IDX_48ce552495d14eae9b187bb671` (`name`)');
    await queryRunner.query('ALTER TABLE `roles` ADD UNIQUE INDEX `IDX_648e3f5447f725579d7d4ffdfb` (`name`)');
    await queryRunner.query('CREATE INDEX `IDX_b20f4ad2fcaa0d311f92516267` ON `rolePermissions` (`roleId`)');
    await queryRunner.query('CREATE INDEX `IDX_5cb213a16a7b5204c8aff88151` ON `rolePermissions` (`permissionId`)');
    await queryRunner.query('CREATE INDEX `IDX_21ab60e082ad8fb06039b0ddf4` ON `userAssignedRoles` (`roleId`)');
    await queryRunner.query('CREATE INDEX `IDX_010f0e08ba2ac1f742f50ba27d` ON `userAssignedRoles` (`userId`)');
    await queryRunner.query(
      'ALTER TABLE `rolePermissions` ADD CONSTRAINT `FK_b20f4ad2fcaa0d311f925162675` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE `rolePermissions` ADD CONSTRAINT `FK_5cb213a16a7b5204c8aff881518` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `userAssignedRoles` ADD CONSTRAINT `FK_21ab60e082ad8fb06039b0ddf47` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE `userAssignedRoles` ADD CONSTRAINT `FK_010f0e08ba2ac1f742f50ba27d2` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    // data fixes from the previous migrations
    await queryRunner.query("UPDATE `permissions` SET `moduleName` = replace(`moduleName`, '\"', '')");
    await queryRunner.query("UPDATE `permissions` SET `resourceContext` = replace(`resourceContext`, '\"', '')");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `userAssignedRoles` DROP FOREIGN KEY `FK_010f0e08ba2ac1f742f50ba27d2`');
    await queryRunner.query('ALTER TABLE `userAssignedRoles` DROP FOREIGN KEY `FK_21ab60e082ad8fb06039b0ddf47`');
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP FOREIGN KEY `FK_5cb213a16a7b5204c8aff881518`');
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP FOREIGN KEY `FK_b20f4ad2fcaa0d311f925162675`');
    await queryRunner.query('DROP INDEX `IDX_010f0e08ba2ac1f742f50ba27d` ON `userAssignedRoles`');
    await queryRunner.query('DROP INDEX `IDX_21ab60e082ad8fb06039b0ddf4` ON `userAssignedRoles`');
    await queryRunner.query('DROP INDEX `IDX_5cb213a16a7b5204c8aff88151` ON `rolePermissions`');
    await queryRunner.query('DROP INDEX `IDX_b20f4ad2fcaa0d311f92516267` ON `rolePermissions`');
    await queryRunner.query('ALTER TABLE `roles` DROP INDEX `IDX_648e3f5447f725579d7d4ffdfb`');
    await queryRunner.query('ALTER TABLE `permissions` DROP INDEX `IDX_48ce552495d14eae9b187bb671`');
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `rolePermissions` ADD PRIMARY KEY (`roleId`)');
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP COLUMN `permissionId`');
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP COLUMN `roleId`');
    await queryRunner.query('ALTER TABLE `rolePermissions` ADD `authorizationPointId` int NOT NULL');
    await queryRunner.query('ALTER TABLE `rolePermissions` ADD PRIMARY KEY (`authorizationPointId`)');
    await queryRunner.query('ALTER TABLE `rolePermissions` ADD `userTypeId` int NOT NULL');
    await queryRunner.query('ALTER TABLE `rolePermissions` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `rolePermissions` ADD PRIMARY KEY (`userTypeId`, `authorizationPointId`)');
    await queryRunner.query('ALTER TABLE `userAssignedRoles` CHANGE `roleId` `userTypeId` int NOT NULL');
    await queryRunner.query('CREATE INDEX `IDX_edf51db2850541f497e44dc035` ON `userAssignedRoles` (`userId`)');
    await queryRunner.query('CREATE INDEX `IDX_1bc7728887ce7726fa46a7ea41` ON `userAssignedRoles` (`userTypeId`)');
    await queryRunner.query(
      'CREATE INDEX `IDX_fb62cc28426e6f6a07bf7c2a0a` ON `rolePermissions` (`authorizationPointId`)'
    );
    await queryRunner.query('CREATE INDEX `IDX_cebb41c400fa054c9a650ae532` ON `rolePermissions` (`userTypeId`)');
    await queryRunner.query('CREATE UNIQUE INDEX `IDX_c3d9e1af185bc4387f0a51e777` ON `roles` (`name`)');
    await queryRunner.query('CREATE UNIQUE INDEX `IDX_e29ca7581fdccb478db932853b` ON `permissions` (`name`)');
    await queryRunner.query(
      'ALTER TABLE `userAssignedRoles` ADD CONSTRAINT `FK_edf51db2850541f497e44dc0350` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `userAssignedRoles` ADD CONSTRAINT `FK_1bc7728887ce7726fa46a7ea415` FOREIGN KEY (`userTypeId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE `rolePermissions` ADD CONSTRAINT `FK_fb62cc28426e6f6a07bf7c2a0a0` FOREIGN KEY (`authorizationPointId`) REFERENCES `permissions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `rolePermissions` ADD CONSTRAINT `FK_cebb41c400fa054c9a650ae5320` FOREIGN KEY (`userTypeId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
  }
}
