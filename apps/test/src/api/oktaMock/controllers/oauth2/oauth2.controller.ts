import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  Query,
  Res,
  UseInterceptors
} from '@nestjs/common';

import { HTTPErrorInterceptor } from '@node-c/api-http';

import type { Response } from 'express';

import type { DomainOktaMockOAuth2TokenResult } from '../../../../domain/oktaMock/services/oauth2/oauth2.definitions.js';
import { DomainOktaMockOAuth2Service } from '../../../../domain/oktaMock/services/oauth2/oauth2.service.js';

import { APIOktaMockOAuth2AuthorizeDto } from './dto/authorize.dto.js';
import { APIOktaMockOAuth2TokenDto } from './dto/token.dto.js';

// the same paths as Okta's org authorization server
@Injectable()
@Controller('oauth2/v1')
@UseInterceptors(HTTPErrorInterceptor)
export class APIOktaMockOAuth2Controller {
  constructor(protected domainOAuth2Service: DomainOktaMockOAuth2Service) {}

  @Get('authorize')
  authorize(
    @Query() query: APIOktaMockOAuth2AuthorizeDto,
    @Res() res: Response
  ): void {
    const redirectUrl = this.domainOAuth2Service.authorize({
      clientId: query.client_id,
      codeChallenge: query.code_challenge,
      codeChallengeMethod: query.code_challenge_method,
      loginHint: query.login_hint,
      nonce: query.nonce,
      redirectUri: query.redirect_uri,
      responseType: query.response_type,
      scope: query.scope,
      state: query.state
    });
    res.redirect(HttpStatus.FOUND, redirectUrl);
  }

  @HttpCode(HttpStatus.OK)
  @Post('token')
  token(
    @Body() body: APIOktaMockOAuth2TokenDto
  ): DomainOktaMockOAuth2TokenResult {
    return this.domainOAuth2Service.token({
      clientId: body.client_id,
      clientSecret: body.client_secret,
      code: body.code,
      codeVerifier: body.code_verifier,
      grantType: body.grant_type,
      redirectUri: body.redirect_uri
    });
  }
}
