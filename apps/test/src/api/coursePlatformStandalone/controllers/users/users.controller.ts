import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
  Req
} from '@nestjs/common';

import * as NodeCApiHttp from '@node-c/api-http';
import { type DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';
import type {
  DataDefaultData,
  DomainEntityServiceDefaultData,
  GenericObject
} from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  AppConfigDomainIAMAuthenticationStep,
  LoggerService
} from '@node-c/core';

import type {
  DataDBUsersCreateUserData,
  DataDBUsersUpdateUserData
} from '../../../../data/db/entities/users/users.definitions.js';
import type { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformStandaloneAuthenticationManagerService } from '../../../../domain/coursePlatformStandalone/services/authenticationManager/authenticationManager.service.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformStandaloneUsersService } from '../../../../domain/coursePlatformStandalone/services/users/users.service.js';

import type { APICoursePlatformStandaloneUsersAuthenticateDto } from './dto/authenticate.dto.js';
import type { APICoursePlatformStandaloneUsersAuthenticateOAuth2CallbackDto } from './dto/authenticateOAuth2Callback.dto.js';

@NodeCApiHttp.AccessControlContext('CoursePlatformUsersEntityController')
@Injectable()
@Controller('users')
export class APICoursePlatformStandaloneUsersEntityController extends RESTAPIEntityControler<
  DataDBUser,
  DomainCoursePlatformStandaloneUsersService,
  DefaultDtos<DataDBUser>,
  DomainEntityServiceDefaultData<DataDBUser>,
  DataDefaultData<DataDBUser> & {
    Create: DataDBUsersCreateUserData;
    Update: DataDBUsersUpdateUserData;
  }
> {
  constructor(
    domainEntityService: DomainCoursePlatformStandaloneUsersService,
    protected domainAuthenticationManagerService: DomainCoursePlatformStandaloneAuthenticationManagerService,
    logger: LoggerService
  ) {
    super(
      domainEntityService,
      RESTAPIEntityControler.getDefaultDtos<DataDBUser>(),
      logger,
      ['find', 'findOne', 'update']
    );
  }

  // Standalone authentication with passthrough (as a consumer) - completion step
  @Patch('auth/:authType')
  authenticateComplete(
    @Body()
    body: APICoursePlatformStandaloneUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<
    DomainCoursePlatformStandaloneAuthenticationManagerService['authenticate']
  > {
    return this.domainAuthenticationManagerService.authenticate({
      ...body,
      auth: { ...body.auth, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }

  // Federated authentication - initiation step
  @Post('auth/:authType')
  authenticateInitiate(
    @Body()
    body: APICoursePlatformStandaloneUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<
    DomainCoursePlatformStandaloneAuthenticationManagerService['authenticate']
  > {
    return this.domainAuthenticationManagerService.authenticate({
      ...body,
      auth: { ...body.auth, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Initiate
    });
  }

  // Federated authentication - completion step (oauth2 callbacks)
  @Get('auth/:authType')
  authenticateOAuth2Callback(
    @Query()
    query: APICoursePlatformStandaloneUsersAuthenticateOAuth2CallbackDto,
    @Param()
    params: { authType: string }
  ): ReturnType<
    DomainCoursePlatformStandaloneAuthenticationManagerService['authenticate']
  > {
    return this.domainAuthenticationManagerService.authenticate({
      auth: { ...query, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }

  @NodeCApiHttp.AccessControlResource('findLoginLogs')
  @Get('loginLogs')
  findLoginLogs(
    @Req() req: NodeCApiHttp.RequestWithLocals<DataDBUser>
  ): ReturnType<DomainCoursePlatformStandaloneUsersService['findLoginLogs']> {
    return this.domainEntityService.findLoginLogs({
      ...req.query,
      filters: {
        ...((req.query as { filters: GenericObject }).filters || {}),
        userId: req.locals?.user?.id
      }
    });
  }
}
