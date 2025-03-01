import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Repository } from 'typeorm';

import { AccessControlPoint, AccessControlPointEntity } from './accessControlPoints.entity';

@Injectable()
export class AccessControlPointsService extends RDBEntityService<AccessControlPoint> {
  constructor(
    qb: SQLQueryBuilderService,
    @InjectRepository(AccessControlPointEntity)
    repository: Repository<AccessControlPoint>
  ) {
    super(qb, repository, AccessControlPointEntity);
  }
}
