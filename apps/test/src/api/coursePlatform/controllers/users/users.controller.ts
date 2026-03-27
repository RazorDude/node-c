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

import { CoursePlatformUsersAuthenticateDto, CoursePlatformUsersAuthenticateOAuth2CallbackDto } from './dto';

import { User as DBUser, UsersCreateUserData, UsersUpdateUserData } from '../../../../data/db';
import { CoursePlatformUserManagerService, CoursePlatformUsersService } from '../../../../domain/coursePlatform';

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
    domainEntityService: CoursePlatformUsersService,
    // eslint-disable-next-line no-unused-vars
    protected domainUserManagerService: CoursePlatformUserManagerService,
    logger: LoggerService
  ) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DBUser>(), logger, ['find', 'findOne', 'update']);
  }

  // Standalone authentication with passthrough (as a consumer)
  @Post('tokens')
  async authenticate(
    @Body()
    body: CoursePlatformUsersAuthenticateDto
  ): ReturnType<CoursePlatformUserManagerService['authenticate']> {
    return this.domainUserManagerService.authenticate({ ...body, mainFilterField: 'email' });
  }

  // Standalone authentication - ouath2 callbacks
  @Get('tokens/callback/:authType')
  async authenticateOAuth2Callback(
    @Param()
    params: { authType: string },
    @Query()
    query: CoursePlatformUsersAuthenticateOAuth2CallbackDto
  ): ReturnType<CoursePlatformUserManagerService['authenticate']> {
    return this.domainUserManagerService.authenticate({
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
