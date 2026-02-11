import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { AppConfigAPIHTTP, ConfigProviderService } from '@node-c/core';
import {
  AuthorizationPoint,
  IAMAuthorizationService,
  IAMTokenManagerService,
  IAMUsersService,
  UserTokenEnityFields
} from '@node-c/domain-iam';

import { NextFunction, Response } from 'express';

import { Constants, RequestWithLocals } from '../common/definitions';
import { checkRoutes } from '../common/utils';

/*
 * Authorization middleware - used for general authorization of the HTTP resource.
 */
@Injectable()
export class HTTPAuthorizationMiddleware<User extends object> implements NestMiddleware {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    @Inject(Constants.API_MODULE_AUTHORIZATION_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected authorizationService: IAMAuthorizationService<AuthorizationPoint<unknown>>,
    @Inject(Constants.AUTORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected tokenManager?: IAMTokenManagerService<UserTokenEnityFields>,
    @Inject(Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected usersService?: IAMUsersService<User>
  ) {}

  use(req: RequestWithLocals<unknown>, res: Response, next: NextFunction): void {
    (async () => {
      const moduleConfig = this.configProvider.config.api![this.moduleName] as AppConfigAPIHTTP;
      const { anonymousAccessRoutes } = moduleConfig;
      const requestMethod = req.method.toLowerCase();
      if (!req.locals) {
        req.locals = {};
      }
      if (anonymousAccessRoutes && Object.keys(anonymousAccessRoutes).length) {
        const originalUrl = req.originalUrl.split('?')[0];
        let isAnonymous = false;
        for (const route in anonymousAccessRoutes) {
          if (
            checkRoutes(originalUrl, [route]) &&
            anonymousAccessRoutes[route].find(method => method === requestMethod)
          ) {
            isAnonymous = true;
            break;
          }
        }
        if (isAnonymous) {
          req.locals.isAnonymous = true;
          next();
          return;
        }
      }
      const { tokenManager, usersService } = this;
      const hasApiKey = !!req.headers.authorization?.match(/^ApiKey\s/);
      if (hasApiKey) {
        const [apiKeyFromHeader, requestSignature] =
          req.headers.authorization?.replace(/^ApiKey\s/, '')?.split(' ') || [];
        let signatureContent = '';
        if (requestMethod === 'get' && req.query && Object.keys(req.query).length) {
          signatureContent = JSON.stringify(req.query);
        } else if (
          (requestMethod === 'delete' ||
            requestMethod === 'patch' ||
            requestMethod === 'post' ||
            requestMethod === 'put') &&
          req.body &&
          Object.keys(req.body).length
        ) {
          signatureContent = JSON.stringify(req.body);
        } else {
          signatureContent = req.originalUrl.split('?')[0];
        }
        const { valid } = await this.authorizationService.authorizeApiKey(
          {
            apiKey: apiKeyFromHeader,
            signature: requestSignature,
            signatureContent
          },
          { config: moduleConfig }
        );
        if (!valid) {
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        next();
        return;
      } else if (!tokenManager) {
        console.error('Missing api key in the configuration and no tokenManager set up.');
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      let tokens: string[] = [];
      let authToken = req.headers.authorization;
      let refreshToken: string | undefined;
      let useCookie = false;
      if (typeof authToken === 'string' && authToken.length && authToken.match(/^Bearer\s/)) {
        tokens = authToken.split(' ');
        if (tokens.length) {
          authToken = tokens[1];
          refreshToken = tokens[2];
        }
      } else {
        authToken = req.cookies['sid'];
        useCookie = true;
      }
      const { newAuthToken, tokenContent, valid } =
        await this.authorizationService.authorizeBearer<UserTokenEnityFields>(
          { authToken, refreshToken },
          { identifierDataField: usersService ? 'userId' : undefined }
        );
      if (!valid) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (usersService) {
        const userId = tokenContent?.data?.userId;
        if (!userId) {
          console.error('Missing userId in the tokenContent data.');
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        req.locals!.user = await usersService.getUserWithPermissionsData({ filters: { id: userId } });
      }
      if (newAuthToken) {
        res.setHeader('Authorization', `Bearer ${newAuthToken}${refreshToken ? ` ${refreshToken}` : ''}`);
        if (useCookie) {
          res.cookie('sid', newAuthToken);
        }
      }
      next();
    })().then(
      () => true,
      err => {
        console.error(err);
        res.status((err && err.status) || HttpStatus.INTERNAL_SERVER_ERROR).end();
      }
    );
  }
}
