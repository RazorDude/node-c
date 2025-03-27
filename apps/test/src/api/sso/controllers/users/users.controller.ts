import { Body, Controller, Injectable, Post } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';

import { IAMUsersService } from '../../../../domain/iam';
import { CacheUser } from '../../../../persistance/cache';

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
  ): ReturnType<IAMUsersService['createAccessToken']> {
    // ): Promise<void> {
    return this.domainEntityService.createAccessToken(body);
    // console.log(body);
  }
}
