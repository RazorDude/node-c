import { Injectable } from '@nestjs/common';

import { DataEntityService, DomainDataEntityServiceType, DomainMethod } from '@node-c/core';
import { AuthorizationData, IAMAuthorizationService as BaseAuthorizationService } from '@node-c/domain-iam';

import { AuthorizationPoint, CacheAuthorizationPointsEntityService } from '../../../../data/cache';
import { AuthorizationPointsService as DBUAuthorizationPointsEntityService } from '../../../../data/db';
import { IAMTokenManagerService } from '../tokenManager';

@Injectable()
export class IAMAuthorizationService extends BaseAuthorizationService<AuthorizationPoint> {
  constructor(
    protected dataAuthorizationPointsService: CacheAuthorizationPointsEntityService,
    protected dataDBAuthorizationPointsService: DBUAuthorizationPointsEntityService,
    protected tokenManager: IAMTokenManagerService
  ) {
    super(
      dataAuthorizationPointsService,
      [DomainMethod.Find],
      {
        db: dataDBAuthorizationPointsService as DataEntityService<Partial<AuthorizationPoint>>
      },
      tokenManager
    );
  }

  async mapAuthorizationPoints(moduleName: string): Promise<AuthorizationData<unknown>> {
    return await super.mapAuthorizationPoints(moduleName, {
      individualSearch: false,
      dataServices: [DomainDataEntityServiceType.Main, 'db'],
      // optionsOverridesByService: {
      //   [DomainDataEntityServiceType.Main]: { individualSearch: false }
      // },
      saveAdditionalResultsInFirstService: { serviceName: 'db', useResultsForFirstService: true }
    });
  }
}
