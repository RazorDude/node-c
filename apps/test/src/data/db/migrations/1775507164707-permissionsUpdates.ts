import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermissionsUpdates1775507164707 implements MigrationInterface {
  name = 'PermissionsUpdates1775507164707';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // authorizationPoints -> permissions
    // 1. Rename table
    await queryRunner.query('ALTER TABLE `authorizationPoints` RENAME `permissions`');
    // 2. Add new columns
    await queryRunner.query(
      'ALTER TABLE `permissions` ADD COLUMN `moduleName` varchar(255) NULL, ADD COLUMN `resourceContext` varchar(255) NULL, CHANGE COLUMN `handlerNames` `resources` json NULL'
    );
    // 3. Migrate the data
    await queryRunner.query(
      "UPDATE `permissions` SET `moduleName` = json_extract(`moduleNames`, '$[0]'), `resourceContext` = json_extract(`controllerNames`, '$[0]')"
    );
    // 4. Remove old columns
    await queryRunner.query('ALTER TABLE `permissions` DROP COLUMN `moduleNames`, DROP COLUMN `controllerNames`');

    // userTypes -> roles
    // 1. Rename table
    await queryRunner.query('ALTER TABLE `userTypes` RENAME `roles`');

    // userTypeAuthorizationPoints -> rolePermissions
    // 1. Rename table
    await queryRunner.query('ALTER TABLE `userTypeAuthorizationPoints` RENAME `rolePermissions`');

    // userTypesAssignedUsers -> userAssignedRoles
    // 1. Rename table
    await queryRunner.query('ALTER TABLE `userTypeAssignedUsers` RENAME `userAssignedRoles`');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
