import { Body, Controller, Get, Injectable, Param, Patch, Post, Query } from '@nestjs/common';

import { AccessControlContext } from '@node-c/api-http';
import { AppConfigDomainIAMAuthenticationStep, LoggerService } from '@node-c/core';

import {
  APICoursePlatformFederatedUsersAuthenticateDto,
  APICoursePlatformFederatedUsersAuthenticateOAuth2CallbackDto
} from './dto';

import { DomainCoursePlatformFederatedAuthenticationManagerService } from '../../../../domain/coursePlatformFederated';

@AccessControlContext('CoursePlatformUsersEntityController')
@Injectable()
@Controller('users')
export class APICoursePlatformFederatedUsersEntityController {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected domainAuthenticationManagerService: DomainCoursePlatformFederatedAuthenticationManagerService,
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService
  ) {}

  // Federated authentication - completion step
  @Patch('auth/:authType')
  async authenticateComplete(
    @Body()
    body: APICoursePlatformFederatedUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainCoursePlatformFederatedAuthenticationManagerService['authenticate']> {
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
    body: APICoursePlatformFederatedUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainCoursePlatformFederatedAuthenticationManagerService['authenticate']> {
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
    query: APICoursePlatformFederatedUsersAuthenticateOAuth2CallbackDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainCoursePlatformFederatedAuthenticationManagerService['authenticate']> {
    return this.domainAuthenticationManagerService.authenticate({
      auth: { ...query, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }
}
