import { Injectable } from '@nestjs/common';

import { AccessControlService as BaseAccessControlService } from '@node-c/domain-iam';

import { AccessControlPoint, AccessControlPointsEntityService } from '../../../../persistance/cache';

@Injectable()
export class IAMAccessControlService extends BaseAccessControlService<AccessControlPoint> {
  constructor(protected persistanceTokensService: AccessControlPointsEntityService) {
    super(persistanceTokensService);
  }

  async test(): Promise<unknown> {
    return await this.persistanceTokensService?.find({ filters: { id: 10 } });
  }
}
