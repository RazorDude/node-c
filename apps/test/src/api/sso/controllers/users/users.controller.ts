import { Body, Controller, Get, Injectable, Param, Post, Query } from '@nestjs/common';

import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';

import { AppConfigDomainIAMAuthenticationStep, LoggerService } from '@node-c/core';

import {
  SSOUsersAuthenticateDto,
  SSOUsersAuthenticateOAuth2CallbackDto,
  SSOUsersAuthenticatePassthroughDto
} from './dto';

import { User as DBUser, UsersDataEntityServiceData as DBUsersDataEntityServiceData } from '../../../../data/db';
import { IAMUserManagerService, IAMUsersDomainEntityServiceData, IAMUsersService } from '../../../../domain/iam';

// TODO: create user (signup)
// TODO: logout
/*
 * This controller is part of the authentication setup as a provider. Its authentication endpoints are used either
 * in standalone mode or as the provider endpoints for other node-c apps' authentication (consumers).
 */
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
    domainEntityService: IAMUsersService,
    // eslint-disable-next-line no-unused-vars
    protected domainUserManagerService: IAMUserManagerService,
    logger: LoggerService
  ) {
    super(domainEntityService, {}, logger, ['find', 'findOne']);
  }

  // Standalone authentication
  @Post('tokens')
  async authenticate(
    @Body()
    body: SSOUsersAuthenticateDto
  ): ReturnType<IAMUserManagerService['authenticate']> {
    return this.domainUserManagerService.authenticate({ ...body, mainFilterField: 'email' });
  }

  // Standalone authentication - ouath2 callbacks
  @Get('tokens/callback/:authType')
  async authenticateOAuth2Callback(
    @Param()
    params: { authType: string },
    @Query()
    query: SSOUsersAuthenticateOAuth2CallbackDto
  ): ReturnType<IAMUserManagerService['authenticate']> {
    return this.domainUserManagerService.authenticate({
      auth: { ...query, type: params.authType },
      mainFilterField: 'email',
      step: AppConfigDomainIAMAuthenticationStep.Complete
    });
  }

  // Passthrough authentication (as a provider)
  @Post('tokens/passthrough')
  async authenticateWithPassthrough(
    @Body()
    body: SSOUsersAuthenticatePassthroughDto
  ): ReturnType<IAMUserManagerService['authenticate']> {
    return this.domainUserManagerService.authenticate({
      ...body,
      auth: { ...body.auth, type: 'passthrough' },
      mainFilterField: 'email'
    });
  }
}
