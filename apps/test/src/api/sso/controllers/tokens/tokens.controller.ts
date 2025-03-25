import { Body, Controller, Injectable, Post } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';
import { DomainCreateResult } from '@node-c/core';

import { IAMTokenManagerService } from '../../../../domain/iam';
import { CacheAuthToken } from '../../../../persistance/cacheAuth';

@Injectable()
@Controller('tokens')
export class SSOTokensEntityController extends RESTAPIEntityControler<CacheAuthToken, IAMTokenManagerService> {
  constructor(protected domainEntityService: IAMTokenManagerService) {
    super(domainEntityService, {});
  }

  // TODO: remove or rename this method
  @Post()
  async Test(
    @Body()
    body: {
      test: boolean;
    }
  ): Promise<DomainCreateResult<CacheAuthToken> | void> {
    console.log(body);
  }
}
