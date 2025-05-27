import { Injectable } from '@nestjs/common';

import { DomainMethod, DomainPersistanceEntityServiceType, PersistanceEntityService } from '@node-c/core';
import { AuthorizationData, IAMAuthorizationService as BaseAuthorizationService } from '@node-c/domain-iam';

import { AuthorizationPoint, CacheAuthorizationPointsEntityService } from '../../../../persistance/cache';
import { AuthorizationPointsService as DBUAuthorizationPointsEntityService } from '../../../../persistance/db';

@Injectable()
export class IAMAuthorizationService extends BaseAuthorizationService<AuthorizationPoint> {
  constructor(
    protected persistanceAuthorizationPointsService: CacheAuthorizationPointsEntityService,
    protected persistanceDBAuthorizationPointsService: DBUAuthorizationPointsEntityService
  ) {
    super(persistanceAuthorizationPointsService, [DomainMethod.Find], {
      db: persistanceDBAuthorizationPointsService as PersistanceEntityService<Partial<AuthorizationPoint>>
    });
  }

  async mapAuthorizationPoints(moduleName: string): Promise<AuthorizationData<unknown>> {
    return await super.mapAuthorizationPoints(moduleName, {
      persistanceServices: [DomainPersistanceEntityServiceType.Main, 'db'],
      saveAdditionalResultsInFirstService: { serviceName: 'db', useResultsForFirstService: true }
    });
  }
}
