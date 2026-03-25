import { Body, Controller, Get, Injectable, Param, Post, Query, Req } from '@nestjs/common';

import { AccessControlContext, AccessControlResource, RequestWithLocals } from '@node-c/api-http';
import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';
import {
  AppConfigDomainIAMAuthenticationStep,
  DataDefaultData,
  DomainEntityServiceDefaultData,
  GenericObject,
  LoggerService
} from '@node-c/core';

import { IAMUserManagerService } from '@node-c/domain-iam';

import { CoursePlatformUsersCreateAccessTokenDto, CoursePlatformUsersCreateAccessTokenOAuth2CallbackDto } from './dto';

import { User as DBUser, UsersCreateUserData, UsersUpdateUserData } from '../../../../data/db';
import { CoursePlatformUsersService } from '../../../../domain/coursePlatform';

@AccessControlContext('CoursePlatformUsersEntityController')
@Injectable()
@Controller('users')
export class CoursePlatformUsersEntityController extends RESTAPIEntityControler<
  DBUser,
  CoursePlatformUsersService,
  DefaultDtos<DBUser>,
  DomainEntityServiceDefaultData<DBUser>,
  DataDefaultData<DBUser> & { Create: UsersCreateUserData; Update: UsersUpdateUserData }
> {
  constructor(
    protected domainEntityService: CoursePlatformUsersService,
    protected logger: LoggerService
  ) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DBUser>(), logger, ['find', 'findOne', 'update']);
  }

  @Post('accessToken')
  async createAccessToken(
    @Body()
    body: CoursePlatformUsersCreateAccessTokenDto
  ): ReturnType<IAMUserManagerService<DBUser>['createAccessToken']> {
    return this.domainUserManagerService.createAccessToken({ ...body, mainFilterField: 'email' });
  }

  @Get('accessToken/callback/:authType')
  async createAccessTokenOAuth2Callback(
    @Param()
    params: { authType: string },
    @Query()
    query: CoursePlatformUsersCreateAccessTokenOAuth2CallbackDto
  ): ReturnType<IAMUserManagerService<DBUser>['createAccessToken']> {
    return this.domainUserManagerService.createAccessToken({
      auth: { ...query, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }

  @AccessControlResource('findLoginLogs')
  @Get('loginLogs')
  async findLoginLogs(@Req() req: RequestWithLocals<DBUser>): ReturnType<CoursePlatformUsersService['findLoginLogs']> {
    return this.domainEntityService.findLoginLogs({
      ...req.query,
      filters: { ...((req.query as { filters: GenericObject }).filters || {}), userId: req.locals?.user?.id }
    });
  }
}
