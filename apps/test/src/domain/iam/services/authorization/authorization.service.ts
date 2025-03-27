import { Injectable } from '@nestjs/common';

import { IAMAuthorizationService as BaseAuthorizationService } from '@node-c/domain-iam';

import { AuthorizationPoint, CacheAuthorizationPointsEntityService } from '../../../../persistance/cache';

@Injectable()
export class IAMAuthorizationService extends BaseAuthorizationService<AuthorizationPoint> {
  constructor(protected persistanceAuthorizationPointsService: CacheAuthorizationPointsEntityService) {
    super(persistanceAuthorizationPointsService);
  }
}
