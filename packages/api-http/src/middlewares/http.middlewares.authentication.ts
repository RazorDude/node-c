import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { AppConfigAPIHTTP, ConfigProviderService } from '@node-c/core';
import { DecodedTokenContent, IAMTokenManagerService, IAMUsersService, UserTokenEnityFields } from '@node-c/domain-iam';

import { checkRoutes } from '@ramster/general-tools';

import { NextFunction, Response } from 'express';

import { Constants, RequestWithLocals } from '../common/definitions';

@Injectable()
export class HTTPAuthenticationMiddleware<User extends object> implements NestMiddleware {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    @Inject(Constants.AUTHENTICATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected tokenManager: IAMTokenManagerService<UserTokenEnityFields>,
    @Inject(Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected usersService: IAMUsersService<User>
  ) {}

  use(req: RequestWithLocals<unknown>, res: Response, next: NextFunction): void {
    (async () => {
      const { anonymousAccessRoutes } = this.configProvider.config.api![this.moduleName] as AppConfigAPIHTTP;
      if (!req.locals) {
        req.locals = {};
      }
      if (anonymousAccessRoutes && Object.keys(anonymousAccessRoutes).length) {
        const originalUrl = req.originalUrl.split('?')[0];
        let isAnonymous = false;
        for (const route in anonymousAccessRoutes) {
          if (
            checkRoutes(originalUrl, [route]) &&
            anonymousAccessRoutes[route].find(method => method === req.method.toLowerCase())
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
      let tokens: string[] = [];
      let authToken = req.headers.authorization;
      let authTokenIsNew = false;
      let refreshToken: string | undefined;
      let tokenContent: DecodedTokenContent<UserTokenEnityFields> | undefined;
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
      if (!authToken) {
        console.error('Missing auth token.');
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      try {
        const tokenRes = await tokenManager.verifyAccessToken(authToken, {
          deleteFromStoreIfExpired: true,
          identifierDataField: 'userId',
          persistNewToken: true,
          purgeStoreOnRenew: true,
          refreshToken,
          refreshTokenAccessTokenIdentifierDataField: 'accessToken'
        });
        tokenContent = tokenRes.content!;
        if (tokenRes.newToken) {
          authTokenIsNew = true;
        }
      } catch (e) {
        console.error('Failed to parse the access or refresh token:', e);
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (authTokenIsNew) {
        res.setHeader('Authorization', `Bearer ${authToken}${refreshToken ? ` ${refreshToken}` : ''}`);
        if (useCookie) {
          res.cookie('sid', authToken);
        }
      }
      const userId = tokenContent?.data?.userId;
      if (!userId) {
        console.error('Missing userId in the tokenContent data.');
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      req.locals!.user = await usersService.getUserWithPermissionsData({ filters: { id: userId } });
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
