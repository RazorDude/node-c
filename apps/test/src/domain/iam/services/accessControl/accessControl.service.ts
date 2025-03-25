import { Injectable } from '@nestjs/common';

import { IAMAccessControlService as BaseAccessControlService } from '@node-c/domain-iam';

import { AccessControlPoint, AccessControlPointsEntityService } from '../../../../persistance/cache';

@Injectable()
export class IAMAccessControlService extends BaseAccessControlService<AccessControlPoint> {
  constructor(protected persistanceAccessControlPointsService: AccessControlPointsEntityService) {
    super(persistanceAccessControlPointsService);
  }
}
