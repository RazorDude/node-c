import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { User as BaseUser, DecodedTokenContent, IAMTokenManagerService, IAMUsersService } from '@node-c/domain-iam';

import { NextFunction, Response } from 'express';

import { Constants, RequestWithLocals } from '../common/definitions';

@Injectable()
export class HTTPAuthenticationMiddleware<
  UserId,
  User extends BaseUser<UserId, unknown>,
  TokenEntityFields extends { refreshToken?: string; userId: UserId }
> implements NestMiddleware
{
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    @Inject(Constants.AUTHENTICATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected tokenManager: IAMTokenManagerService<TokenEntityFields>,
    @Inject(Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected usersService: IAMUsersService<UserId, User, undefined>
  ) {}

  use(req: RequestWithLocals<unknown>, res: Response, next: NextFunction): void {
    if (!req.locals) {
      req.locals = {};
    }
    (async () => {
      const { tokenManager, usersService } = this;
      let tokens: string[] = [];
      let authToken = req.headers.authorization;
      let authTokenIsNew = false;
      let refreshToken: string | undefined;
      let tokenContent: DecodedTokenContent<TokenEntityFields> | undefined;
      let useCookie = false;
      if (typeof authToken === 'string' && authToken.length) {
        tokens = authToken.replace('Bearer ', '').split('');
        if (tokens.length) {
          authToken = tokens[1];
          refreshToken = tokens[2];
        }
      } else {
        authToken = req.cookies['sid'];
        useCookie = true;
      }
      try {
        const tokenRes = await tokenManager.verifyAccessToken(authToken as string, {
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
      let userData = (await usersService.findOne({ filters: { id: userId } })).result;
      if (!userData) {
        userData = (await usersService.getUserWithPermissionsData({ filters: { id: userId } })) as User;
      }
      req.locals!.user = userData as unknown;
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
