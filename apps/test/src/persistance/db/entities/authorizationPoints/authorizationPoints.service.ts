import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Repository } from 'typeorm';

import { AuthorizationPoint, AuthorizationPointEntity } from './authorizationPoints.entity';

@Injectable()
export class AuthorizationPointsService extends RDBEntityService<AuthorizationPoint> {
  constructor(
    qb: SQLQueryBuilderService,
    @InjectRepository(AuthorizationPointEntity)
    repository: Repository<AuthorizationPoint>
  ) {
    super(qb, repository, AuthorizationPointEntity);
  }
}
