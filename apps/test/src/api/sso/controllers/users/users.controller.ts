import { Body, Controller, Injectable, Patch, Post } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';
import { DomainCreateResult } from '@node-c/core';

import { IAMUsersService } from '../../../../domain/iam';
import { CacheUser } from '../../../../persistance/cache';
import { CacheAuthToken } from '../../../../persistance/cacheAuth';

// TODO: create user (signup)
@Injectable()
@Controller('users')
export class SSOUsersEntityController extends RESTAPIEntityControler<CacheUser, IAMUsersService> {
  constructor(protected domainEntityService: IAMUsersService) {
    super(domainEntityService, {});
  }

  @Post('accessToken')
  async createAccessToken(
    @Body()
    body: {
      test: boolean;
    }
    // ): ReturnType<IAMUsersService['createAccessToken']> {
  ): Promise<void> {
    // return this.domainEntityService.createAccessToken();
    console.log(body);
  }

  @Patch('accessToken')
  async verifyAccessToken(
    @Body()
    body: {
      test: boolean;
    }
  ): Promise<DomainCreateResult<CacheAuthToken> | void> {
    console.log(body);
  }
}
