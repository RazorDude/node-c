import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UserTypeEntity } from './userTypes.entity';
import { UserTypesService } from './userTypes.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeEntity])],
  providers: [UserTypesService],
  exports: [UserTypesService, TypeOrmModule]
})
export class UserTypesModule {}
