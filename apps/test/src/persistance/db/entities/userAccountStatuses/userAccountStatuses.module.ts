import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAccountStatusEntity } from './userAccountStatuses.entity';
import { UserAccountStatusesService } from './userAccountStatuses.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccountStatusEntity])],
  providers: [UserAccountStatusesService],
  exports: [UserAccountStatusesService, TypeOrmModule]
})
export class UserAccountStatusesModule {}
