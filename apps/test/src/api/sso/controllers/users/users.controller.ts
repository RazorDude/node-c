import { Body, Controller, Get, Injectable, Param, Patch, Post, Query } from '@nestjs/common';

import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';

import { AppConfigDomainIAMAuthenticationStep, LoggerService } from '@node-c/core';

import { SSOUsersAuthenticateDto } from './dto/authenticate.dto.js';

import { SSOUsersAuthenticateOAuth2CallbackDto } from './dto/authenticateOAuth2Callback.dto.js';

import { SSOUsersAuthenticatePassthroughDto } from './dto/authenticatePassthrough.dto.js';

import { DataDBUsersDataEntityServiceData } from '../../../../data/db/entities/users/users.definitions.js';
import { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
import { DomainIAMAuthenticationManagerService } from '../../../../domain/iam/services/authenticationManager/authenticationManager.service.js';
import { DomainIAMUsersDomainEntityServiceData } from '../../../../domain/iam/services/users/users.definitions.js';
import { DomainIAMUsersService } from '../../../../domain/iam/services/users/users.service.js';

// TODO: create user (signup)
// TODO: logout
// TODO: separate endpoints for delegated and federated authentication
/**
 * This controller is part of the authentication setup as a provider. Its authentication endpoints are used either
 * in standalone mode or as the provider endpoints for other node-c apps' authentication (consumers).
 */
@Injectable()
@Controller('users')
export class SSOUsersEntityController extends RESTAPIEntityControler<
  DataDBUser,
  DomainIAMUsersService,
  DefaultDtos<DataDBUser>,
  DomainIAMUsersDomainEntityServiceData<DataDBUser>,
  DataDBUsersDataEntityServiceData<DataDBUser>
> {
  constructor(
    domainEntityService: DomainIAMUsersService,
    // eslint-disable-next-line no-unused-vars
    protected domainAuthenticationManagerService: DomainIAMAuthenticationManagerService,
    logger: LoggerService
  ) {
    super(domainEntityService, {}, logger, ['find', 'findOne']);
  }

  // Delegated or federated authentication - completion step
  @Patch('auth/:authType')
  async authenticateComplete(
    @Body()
    body: SSOUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainIAMAuthenticationManagerService['authenticate']> {
    return this.domainAuthenticationManagerService.authenticate({
      ...body,
      auth: { ...body.auth, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }

  // Delegated or federated authentication - initiation step
  @Post('auth/:authType')
  async authenticateInitiate(
    @Body()
    body: SSOUsersAuthenticateDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainIAMAuthenticationManagerService['authenticate']> {
    return this.domainAuthenticationManagerService.authenticate({
      ...body,
      auth: { ...body.auth, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Initiate
    });
  }

  // Delegated authentication - completion step (direct oauth2 callbacks)
  @Get('auth/:authType')
  async authenticateOAuth2Callback(
    @Query()
    query: SSOUsersAuthenticateOAuth2CallbackDto,
    @Param()
    params: { authType: string }
  ): ReturnType<DomainIAMAuthenticationManagerService['authenticate']> {
    return this.domainAuthenticationManagerService.authenticate({
      auth: { ...query, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }

  // Passthrough authentication (as a provider)
  @Patch('auth/passthrough')
  @Post('auth/passthrough')
  async authenticateWithPassthrough(
    @Body()
    body: SSOUsersAuthenticatePassthroughDto
  ): ReturnType<DomainIAMAuthenticationManagerService['authenticate']> {
    return this.domainAuthenticationManagerService.authenticate({
      ...body,
      auth: { ...body.auth, type: 'passthrough' },
      mainFilterField: 'email'
    });
  }
}
