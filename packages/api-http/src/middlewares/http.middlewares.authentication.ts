import crypto from 'crypto';

import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { AppConfigAPIHTTP, ConfigProviderService } from '@node-c/core';
import { DecodedTokenContent, IAMTokenManagerService, IAMUsersService, UserTokenEnityFields } from '@node-c/domain-iam';

import { NextFunction, Response } from 'express';

import { Constants, RequestWithLocals } from '../common/definitions';
import { checkRoutes } from '../common/utils';

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
    protected tokenManager?: IAMTokenManagerService<UserTokenEnityFields>,
    @Inject(Constants.AUTHENTICATION_MIDDLEWARE_USERS_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected usersService?: IAMUsersService<User>
  ) {}

  use(req: RequestWithLocals<unknown>, res: Response, next: NextFunction): void {
    (async () => {
      const { anonymousAccessRoutes, apiKey, apiSecret, apiSecretAlgorithm } = this.configProvider.config.api![
        this.moduleName
      ] as AppConfigAPIHTTP;
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
      if (apiKey) {
        const [apiKeyFromHeader, requestSignature] =
          req.headers.authorization?.replace(/^ApiKey\s/, '')?.split(' ') || [];
        if (apiKey !== apiKeyFromHeader) {
          console.error(`${apiKeyFromHeader?.length ? 'Invalid' : 'Missing'} api key in the authorization header.`);
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        if (apiSecret && apiSecretAlgorithm) {
          if (!requestSignature) {
            console.error('Missing request signature in the authorization header.');
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
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
          const calcualtedSignature = crypto
            .createHmac(apiSecretAlgorithm, apiSecret)
            .update(signatureContent)
            .digest('hex');
          if (calcualtedSignature !== requestSignature) {
            console.error(
              `Invalid request signature in the authorization header. Expected: ${calcualtedSignature}. Provided: ${requestSignature}`
            );
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
          }
        }
        next();
        return;
      } else if (!tokenManager) {
        console.error('Missing api key in the configuration and no tokenManager set up.');
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
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
          identifierDataField: usersService ? 'userId' : undefined,
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
      if (usersService) {
        const userId = tokenContent?.data?.userId;
        if (!userId) {
          console.error('Missing userId in the tokenContent data.');
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        req.locals!.user = await usersService.getUserWithPermissionsData({ filters: { id: userId } });
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
