import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { AppConfigAPIHTTP, ConfigProviderService, HttpMethod, LoggerService } from '@node-c/core';
import {
  IAMAuthorizationService,
  IAMTokenManagerService,
  IAMUserManagerService,
  IAMUserManagerUserTokenEnityFields
} from '@node-c/domain-iam';

import { NextFunction, Response } from 'express';
import qs from 'qs';

import { Constants, RequestWithLocals } from '../common/definitions';
import { ErrorCodes } from '../common/definitions/common.errors';
import { checkRoutes } from '../common/utils';

/*
 * Authorization middleware - used for general authorization of the HTTP resource.
 */
@Injectable()
export class HTTPAuthorizationMiddleware<User extends object> implements NestMiddleware {
  constructor(
    @Inject(Constants.API_MODULE_AUTHORIZATION_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected authorizationService: IAMAuthorizationService,
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    @Inject(Constants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected tokenManager?: IAMTokenManagerService<IAMUserManagerUserTokenEnityFields>,
    @Inject(Constants.AUTHORIZATION_MIDDLEWARE_USERS_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected usersService?: IAMUserManagerService<User>
  ) {}

  use(req: RequestWithLocals<unknown>, res: Response, next: NextFunction): void {
    const { configProvider, logger, moduleName, tokenManager, usersService } = this;
    (async () => {
      const moduleConfig = configProvider.config.api![moduleName] as AppConfigAPIHTTP;
      const { allowedApiKeyRoutes, anonymousAccessRoutes } = moduleConfig;
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
      const hasApiKey = !!req.headers.authorization?.match(/^ApiKey\s/);
      if (hasApiKey) {
        const [apiKeyFromHeader, requestSignature] =
          req.headers.authorization?.replace(/^ApiKey\s/, '')?.split(' ') || [];
        let signatureContent = '';
        if (requestMethod === HttpMethod.GET && req.query && Object.keys(req.query).length) {
          signatureContent = qs.stringify(req.query);
        } else if (requestMethod !== HttpMethod.GET && req.body) {
          if (typeof req.body === 'object') {
            signatureContent = JSON.stringify(req.body);
          } else if (typeof req.body === 'string') {
            signatureContent = req.body;
          } else if ('toString' in req.body) {
            signatureContent = req.body.toString();
          }
        }
        if (!signatureContent.length) {
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
          throw new HttpException(
            { message: ErrorCodes.AUTH_INVALID, statusCode: HttpStatus.FORBIDDEN },
            HttpStatus.FORBIDDEN
          );
        }
        // check the allowedApiKeyRoutes
        if (allowedApiKeyRoutes && Object.keys(allowedApiKeyRoutes).length) {
          const originalUrl = req.originalUrl.split('?')[0];
          let isAllowed = false;
          for (const route in allowedApiKeyRoutes) {
            if (
              checkRoutes(originalUrl, [route]) &&
              allowedApiKeyRoutes[route].find(method => method === requestMethod)
            ) {
              isAllowed = true;
              break;
            }
          }
          if (!isAllowed) {
            throw new HttpException(
              { message: ErrorCodes.ROUTE_NOT_ALLOWED, statusCode: HttpStatus.FORBIDDEN },
              HttpStatus.FORBIDDEN
            );
          }
        }
        req.locals.isApiKeyRoute = true;
        next();
        return;
      } else if (!tokenManager) {
        logger.error('Missing api key in the configuration and no tokenManager set up.');
        throw new HttpException(
          { message: ErrorCodes.AUTH_MISSING, statusCode: HttpStatus.UNAUTHORIZED },
          HttpStatus.UNAUTHORIZED
        );
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
      const { newAccessToken, newRefreshToken, tokenContent, valid } =
        await this.authorizationService.authorizeBearer<IAMUserManagerUserTokenEnityFields>(
          { authToken, refreshToken },
          { identifierDataField: usersService ? 'userId' : undefined }
        );
      if (!valid) {
        throw new HttpException(
          { message: ErrorCodes.AUTH_INVALID, statusCode: HttpStatus.UNAUTHORIZED },
          HttpStatus.UNAUTHORIZED
        );
      }
      if (usersService) {
        const userId = tokenContent?.data?.userId;
        if (!userId) {
          logger.error('Missing userId in the tokenContent data.');
          throw new HttpException(
            { message: ErrorCodes.AUTH_INVALID, statusCode: HttpStatus.UNAUTHORIZED },
            HttpStatus.UNAUTHORIZED
          );
        }
        // use the bearer access/id token decoded payload for the user data, if configured this way
        const user = tokenContent?.data?.user;
        if (user) {
          req.locals!.user = user;
        } else if (moduleConfig.localSearchForUsersEnabledOnAuthorization) {
          req.locals!.user = await usersService.getUserWithPermissionsData({ filters: { id: userId } });
        }
        if (!userId) {
          logger.error('Missing user data in the session.');
          throw new HttpException(
            { message: ErrorCodes.AUTH_INVALID, statusCode: HttpStatus.UNAUTHORIZED },
            HttpStatus.UNAUTHORIZED
          );
        }
      }
      if (newAccessToken) {
        const refreshTokenValue = newRefreshToken || refreshToken;
        res.setHeader('Authorization', `Bearer ${newAccessToken}${refreshTokenValue ? ` ${refreshTokenValue}` : ''}`);
        if (useCookie) {
          res.cookie('sid', newAccessToken);
        }
      }
      next();
    })().then(
      () => true,
      err => {
        logger.error(err);
        res.status((err && err.status) || HttpStatus.INTERNAL_SERVER_ERROR).end();
      }
    );
  }
}
