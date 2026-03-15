import { Injectable } from '@nestjs/common';

import { DataEntityService, DomainMethod, LoggerService } from '@node-c/core';
import { IAMAuthorizationService as BaseAuthorizationService } from '@node-c/domain-iam';

import { AuthorizationPoint, CacheAuthorizationPointsEntityService } from '../../../../data/cache';
import { AuthorizationPointsService as DBUAuthorizationPointsEntityService } from '../../../../data/db';
import { IAMTokenManagerService } from '../tokenManager';

@Injectable()
export class IAMAuthorizationService extends BaseAuthorizationService<AuthorizationPoint> {
  constructor(
    protected dataAuthorizationPointsService: CacheAuthorizationPointsEntityService,
    protected dataDBAuthorizationPointsService: DBUAuthorizationPointsEntityService,
    protected logger: LoggerService,
    protected tokenManager: IAMTokenManagerService
  ) {
    super(
      dataAuthorizationPointsService,
      [DomainMethod.Find],
      logger,
      {
        db: dataDBAuthorizationPointsService as DataEntityService<Partial<AuthorizationPoint>>
      },
      tokenManager
    );
  }
}
