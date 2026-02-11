import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1742235349409 implements MigrationInterface {
  name = 'Initial1742235349409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `globalConfigItems` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `id` int NOT NULL AUTO_INCREMENT, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `data` json NOT NULL, `name` varchar(255) NOT NULL, UNIQUE INDEX `IDX_69234b49b4d0537b223df8bab6` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `IDX_69234b49b4d0537b223df8bab6` ON `globalConfigItems`');
    await queryRunner.query('DROP TABLE `globalConfigItems`');
  }
}
