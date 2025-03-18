import { Injectable } from '@nestjs/common';

import { AccessControlService as BaseAccessControlService } from '@node-c/domain-iam';

import { AccessControlPoint, AccessControlPointsEntityService } from '../../../../persistance/cache';

@Injectable()
export class IAMAccessControlPointsService extends BaseAccessControlService<AccessControlPoint> {
  constructor(protected persistanceAccessControlPointsService: AccessControlPointsEntityService) {
    super(persistanceAccessControlPointsService);
  }
}
