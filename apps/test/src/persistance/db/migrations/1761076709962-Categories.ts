import { MigrationInterface, QueryRunner } from 'typeorm';

export class Categories1761076709962 implements MigrationInterface {
  name = 'Categories1761076709962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `userTypeAuthorizationPoints` DROP FOREIGN KEY `FK_6a440eb6859bd3ac63df1061e64`'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAuthorizationPoints` DROP FOREIGN KEY `FK_83510678c89098a99135feaa161`'
    );
    await queryRunner.query('DROP INDEX `IDX_bb43ed6a75a6c094375132f655` ON `authorizationPoints`');
    await queryRunner.query('DROP INDEX `IDX_6a440eb6859bd3ac63df1061e6` ON `userTypeAuthorizationPoints`');
    await queryRunner.query('DROP INDEX `IDX_83510678c89098a99135feaa16` ON `userTypeAuthorizationPoints`');
    await queryRunner.query(
      'CREATE TABLE `category` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(255) NOT NULL, UNIQUE INDEX `IDX_23c05c292c439d77b0de816b50` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query('ALTER TABLE `courses` ADD `category_id` int NULL');
    await queryRunner.query(
      'ALTER TABLE `authorizationPoints` ADD UNIQUE INDEX `IDX_e29ca7581fdccb478db932853b` (`name`)'
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_cebb41c400fa054c9a650ae532` ON `userTypeAuthorizationPoints` (`userTypeId`)'
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_fb62cc28426e6f6a07bf7c2a0a` ON `userTypeAuthorizationPoints` (`authorizationPointId`)'
    );
    await queryRunner.query(
      'ALTER TABLE `courses` ADD CONSTRAINT `FK_e4c260fe6bb1131707c4617f745` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAuthorizationPoints` ADD CONSTRAINT `FK_cebb41c400fa054c9a650ae5320` FOREIGN KEY (`userTypeId`) REFERENCES `userTypes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAuthorizationPoints` ADD CONSTRAINT `FK_fb62cc28426e6f6a07bf7c2a0a0` FOREIGN KEY (`authorizationPointId`) REFERENCES `authorizationPoints`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `userTypeAuthorizationPoints` DROP FOREIGN KEY `FK_fb62cc28426e6f6a07bf7c2a0a0`'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAuthorizationPoints` DROP FOREIGN KEY `FK_cebb41c400fa054c9a650ae5320`'
    );
    await queryRunner.query('ALTER TABLE `courses` DROP FOREIGN KEY `FK_e4c260fe6bb1131707c4617f745`');
    await queryRunner.query('DROP INDEX `IDX_fb62cc28426e6f6a07bf7c2a0a` ON `userTypeAuthorizationPoints`');
    await queryRunner.query('DROP INDEX `IDX_cebb41c400fa054c9a650ae532` ON `userTypeAuthorizationPoints`');
    await queryRunner.query('ALTER TABLE `authorizationPoints` DROP INDEX `IDX_e29ca7581fdccb478db932853b`');
    await queryRunner.query('ALTER TABLE `courses` DROP COLUMN `category_id`');
    await queryRunner.query('DROP INDEX `IDX_23c05c292c439d77b0de816b50` ON `category`');
    await queryRunner.query('DROP TABLE `category`');
    await queryRunner.query(
      'CREATE INDEX `IDX_83510678c89098a99135feaa16` ON `userTypeAuthorizationPoints` (`authorizationPointId`)'
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_6a440eb6859bd3ac63df1061e6` ON `userTypeAuthorizationPoints` (`userTypeId`)'
    );
    await queryRunner.query('CREATE UNIQUE INDEX `IDX_bb43ed6a75a6c094375132f655` ON `authorizationPoints` (`name`)');
    await queryRunner.query(
      'ALTER TABLE `userTypeAuthorizationPoints` ADD CONSTRAINT `FK_83510678c89098a99135feaa161` FOREIGN KEY (`authorizationPointId`) REFERENCES `authorizationPoints`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `userTypeAuthorizationPoints` ADD CONSTRAINT `FK_6a440eb6859bd3ac63df1061e64` FOREIGN KEY (`userTypeId`) REFERENCES `userTypes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE'
    );
  }
}
