import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessControlPointEntity } from './accessControlPoints.entity';
import { AccessControlPointsService } from './accessControlPoints.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccessControlPointEntity])],
  providers: [AccessControlPointsService],
  exports: [AccessControlPointsService, TypeOrmModule]
})
export class AccessControlPointsModule {}
