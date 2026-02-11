import { Controller, Injectable } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';

import { CacheAuthToken } from '../../../../data/cacheAuth';
import { IAMTokenManagerService } from '../../../../domain/iam';

// TODO: consider removing this
@Injectable()
@Controller('tokens')
export class SSOTokensEntityController extends RESTAPIEntityControler<CacheAuthToken, IAMTokenManagerService> {
  constructor(protected domainEntityService: IAMTokenManagerService) {
    super(domainEntityService, {});
  }
}
