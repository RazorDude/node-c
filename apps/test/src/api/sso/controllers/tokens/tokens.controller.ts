import { Controller, Injectable } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';

import { IAMTokenManagerService } from '../../../../domain/iam';
import { CacheAuthToken } from '../../../../persistance/cacheAuth';

// TODO: consider removing this
@Injectable()
@Controller('tokens')
export class SSOTokensEntityController extends RESTAPIEntityControler<CacheAuthToken, IAMTokenManagerService> {
  constructor(protected domainEntityService: IAMTokenManagerService) {
    super(domainEntityService, {});
  }
}
