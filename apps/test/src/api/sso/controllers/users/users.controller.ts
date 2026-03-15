import { Body, Controller, Get, Injectable, Param, Post, Query } from '@nestjs/common';

import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';

import { AppConfigDomainIAMAuthenticationStep, LoggerService } from '@node-c/core';

import { SSOUsersCreateAccessTokenDto, SSOUsersCreateAccessTokenOAuth2CallbackDto } from './dto';

import { User as DBUser, UsersDataEntityServiceData as DBUsersDataEntityServiceData } from '../../../../data/db';
import { IAMUserManagerService, IAMUsersDomainEntityServiceData, IAMUsersService } from '../../../../domain/iam';

// TODO: create user (signup)
// TODO: logout
@Injectable()
@Controller('users')
export class SSOUsersEntityController extends RESTAPIEntityControler<
  DBUser,
  IAMUsersService,
  DefaultDtos<DBUser>,
  IAMUsersDomainEntityServiceData<DBUser>,
  DBUsersDataEntityServiceData<DBUser>
> {
  constructor(
    protected domainEntityService: IAMUsersService,
    // eslint-disable-next-line no-unused-vars
    protected domainUserManagerService: IAMUserManagerService,
    protected logger: LoggerService
  ) {
    super(domainEntityService, {}, logger, ['find', 'findOne']);
  }

  @Post('accessToken')
  async createAccessToken(
    @Body()
    body: SSOUsersCreateAccessTokenDto
  ): ReturnType<IAMUserManagerService['createAccessToken']> {
    return this.domainUserManagerService.createAccessToken({ ...body, mainFilterField: 'email' });
  }

  @Get('accessToken/callback/:authType')
  async createAccessTokenOAuth2Callback(
    @Param()
    params: { authType: string },
    @Query()
    query: SSOUsersCreateAccessTokenOAuth2CallbackDto
  ): ReturnType<IAMUserManagerService['createAccessToken']> {
    return this.domainUserManagerService.createAccessToken({
      auth: { ...query, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }
}
