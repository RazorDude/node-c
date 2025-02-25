import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './users.entity';
import { UsersService } from './users.service';
import { UserSubscriber } from './users.subscriber';

@Module({
  // TODO: check if removing TypeOrmModule here works and apply it elsewhere
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, UserSubscriber],
  exports: [UsersService, UserSubscriber]
})
export class UsersModule {}
