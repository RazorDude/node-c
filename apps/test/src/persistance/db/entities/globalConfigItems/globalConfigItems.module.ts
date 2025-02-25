import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { GlobalConfigItemEntity } from './globalConfigItems.entity';
import { GlobalConfigItemsService } from './globalConfigItems.service';

@Module({
  imports: [TypeOrmModule.forFeature([GlobalConfigItemEntity])],
  providers: [GlobalConfigItemsService],
  exports: [GlobalConfigItemsService, TypeOrmModule]
})
export class GlobalConfigItemsModule {}
