import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import {
  AppConfigDomainIAMAuthenticationStep,
  type LoggerService
} from '@node-c/core';

import type { DomainCoursePlatformFederatedAuthenticationManagerService } from '../../../../domain/coursePlatformFederated/services/authenticationManager/authenticationManager.service.js';
import type { APICoursePlatformFederatedUsersAuthenticateDto } from './dto/authenticate.dto.js';
import type { APICoursePlatformFederatedUsersAuthenticateOAuth2CallbackDto } from './dto/authenticateOAuth2Callback.dto.js';

@AccessControlContext('CoursePlatformUsersEntityController')
@Injectable()
@Controller('users')
export class APICoursePlatformFederatedUsersEntityController {
  constructor(
    protected domainAuthenticationManagerService: DomainCoursePlatformFederatedAuthenticationManagerService,
    protected logger: LoggerService
  ) {}

  // Federated authentication - completion step
  @Patch('auth/:authType')
  authenticateComplete(
    @Body()
    body: APICoursePlatformFederatedUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<
    DomainCoursePlatformFederatedAuthenticationManagerService['authenticate']
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
    body: APICoursePlatformFederatedUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<
    DomainCoursePlatformFederatedAuthenticationManagerService['authenticate']
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
    query: APICoursePlatformFederatedUsersAuthenticateOAuth2CallbackDto,
    @Param()
    params: { authType: string }
  ): ReturnType<
    DomainCoursePlatformFederatedAuthenticationManagerService['authenticate']
  > {
    return this.domainAuthenticationManagerService.authenticate({
      auth: { ...query, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }
}
