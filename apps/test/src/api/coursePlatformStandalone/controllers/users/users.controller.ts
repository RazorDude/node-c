import { Body, Controller, Get, Injectable, Param, Patch, Post, Query, Req } from '@nestjs/common';

import { AccessControlContext, AccessControlResource, RequestWithLocals } from '@node-c/api-http';
import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';
import {
  AppConfigDomainIAMAuthenticationStep,
  DataDefaultData,
  DomainEntityServiceDefaultData,
  GenericObject,
  LoggerService
} from '@node-c/core';

import {
  APICoursePlatformStandaloneUsersAuthenticateDto,
  APICoursePlatformStandaloneUsersAuthenticateOAuth2CallbackDto
} from './dto';

import { DataDBUser, DataDBUsersCreateUserData, DataDBUsersUpdateUserData } from '../../../../data/db';
import {
  DomainCoursePlatformStandaloneAuthenticationManagerService,
  DomainCoursePlatformStandaloneUsersService
} from '../../../../domain/coursePlatformStandalone';

@AccessControlContext('CoursePlatformUsersEntityController')
@Injectable()
@Controller('users')
export class APICoursePlatformStandaloneUsersEntityController extends RESTAPIEntityControler<
  DataDBUser,
  DomainCoursePlatformStandaloneUsersService,
  DefaultDtos<DataDBUser>,
  DomainEntityServiceDefaultData<DataDBUser>,
  DataDefaultData<DataDBUser> & { Create: DataDBUsersCreateUserData; Update: DataDBUsersUpdateUserData }
> {
  constructor(
    domainEntityService: DomainCoursePlatformStandaloneUsersService,
    // eslint-disable-next-line no-unused-vars
    protected domainAuthenticationManagerService: DomainCoursePlatformStandaloneAuthenticationManagerService,
    logger: LoggerService
  ) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DataDBUser>(), logger, [
      'find',
      'findOne',
      'update'
    ]);
  }

  // Standalone authentication with passthrough (as a consumer) - completion step
  @Patch('auth/:authType')
  async authenticateComplete(
    @Body()
    body: APICoursePlatformStandaloneUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainCoursePlatformStandaloneAuthenticationManagerService['authenticate']> {
    return this.domainAuthenticationManagerService.authenticate({
      ...body,
      auth: { ...body.auth, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }

  // Federated authentication - initiation step
  @Post('auth/:authType')
  async authenticateInitiate(
    @Body()
    body: APICoursePlatformStandaloneUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainCoursePlatformStandaloneAuthenticationManagerService['authenticate']> {
    return this.domainAuthenticationManagerService.authenticate({
      ...body,
      auth: { ...body.auth, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Initiate
    });
  }

  // Federated authentication - completion step (oauth2 callbacks)
  @Get('auth/:authType')
  async authenticateOAuth2Callback(
    @Query()
    query: APICoursePlatformStandaloneUsersAuthenticateOAuth2CallbackDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainCoursePlatformStandaloneAuthenticationManagerService['authenticate']> {
    return this.domainAuthenticationManagerService.authenticate({
      auth: { ...query, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }

  @AccessControlResource('findLoginLogs')
  @Get('loginLogs')
  async findLoginLogs(
    @Req() req: RequestWithLocals<DataDBUser>
  ): ReturnType<DomainCoursePlatformStandaloneUsersService['findLoginLogs']> {
    return this.domainEntityService.findLoginLogs({
      ...req.query,
      filters: { ...((req.query as { filters: GenericObject }).filters || {}), userId: req.locals?.user?.id }
    });
  }
}
