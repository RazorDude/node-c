import {
  AppConfigDomainIAM,
  ApplicationError,
  ConfigProviderService,
  DomainCreateOptions,
  DomainCreateResult,
  DomainEntityService,
  GenericObject,
  PersistanceEntityService
} from '@node-c/core';

import * as jwt from 'jsonwebtoken';
import ld from 'lodash';

import {
  DecodedTokenContent,
  TokenEntity,
  TokenManagerCreateData,
  TokenManagerCreateOptions,
  TokenType,
  VerifyAccessTokenOptions,
  VerifyAccessTokenReturnData
} from './iam.tokenManager.definitions';

// TODO: console.error -> logger
export class IAMTokenManagerService<TokenEntityFields extends object> extends DomainEntityService<
  TokenEntity<TokenEntityFields>,
  PersistanceEntityService<TokenEntity<TokenEntityFields>>
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected persistanceEntityService: PersistanceEntityService<TokenEntity<TokenEntityFields>>
  ) {
    super(persistanceEntityService!, ['create']);
  }

  async create(
    data: TokenManagerCreateData<TokenEntityFields>,
    options: TokenManagerCreateOptions
  ): Promise<DomainCreateResult<TokenEntity<TokenEntityFields>>> {
    const { configProvider, moduleName, persistanceEntityService } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { type, ...tokenData } = data;
    const { expiresInMinutes, identifierDataField, persist, purgeOldFromPersistance } = options;
    const signOptions = {} as jwt.SignOptions;
    let secret: string;
    // Leaving this ugly big if-statement as is, in case we need to expand it in the future.
    if (type === TokenType.Access) {
      secret = moduleConfig.jwtAccessSecret;
      if (expiresInMinutes) {
        signOptions.expiresIn = expiresInMinutes * 60;
      } else if (moduleConfig.accessTokenExpiryTimeInMinutes) {
        signOptions.expiresIn = moduleConfig.accessTokenExpiryTimeInMinutes * 60;
      }
    } else if (type === TokenType.Refresh) {
      secret = moduleConfig.jwtRefreshSecret;
      if (expiresInMinutes) {
        signOptions.expiresIn = expiresInMinutes * 60;
      } else if (moduleConfig.refreshTokenExpiryTimeInMinutes) {
        signOptions.expiresIn = moduleConfig.refreshTokenExpiryTimeInMinutes * 60;
      }
    } else {
      throw new ApplicationError(`[TokenManager.create]: Invalid token type - "${type}".`);
    }
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign({ data }, secret, signOptions, (err, token) => {
        if (err) {
          console.error(err);
          reject(new ApplicationError('Failed to sign token.'));
          return;
        }
        resolve(token as string);
      });
    });
    const objectToSave = { ...tokenData, token, type } as TokenEntity<TokenEntityFields>;
    // save the token in the persistance system of choice
    // TODO: multi-persistance isn't handled well here (or, actually, at all)
    if (persist && persistanceEntityService) {
      if (purgeOldFromPersistance && identifierDataField) {
        const identifierValue = ld.get(data, identifierDataField);
        if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
          await persistanceEntityService.delete({
            filters: { [identifierDataField]: identifierValue }
          });
        }
      }
      await super.create(objectToSave, { ttl: signOptions.expiresIn } as DomainCreateOptions);
    }
    return { result: objectToSave };
  }

  async verifyAccessToken(
    token: string,
    options?: VerifyAccessTokenOptions
  ): Promise<VerifyAccessTokenReturnData<TokenEntityFields>> {
    const { configProvider, moduleName, persistanceEntityService } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const {
      deleteFromStoreIfExpired,
      identifierDataField,
      newTokenExpiresInMinutes,
      persistNewToken,
      purgeStoreOnRenew,
      refreshToken,
      refreshTokenAccessTokenIdentifierDataField
    } = options || {};
    // decode the token
    const { content, error } = await this.verify(token, moduleConfig.jwtAccessSecret);
    let forceRenew = true;
    let newToken: string | undefined;
    // check for errors
    if (error) {
      let errorToThrow: Error | undefined;
      let throwError = true;
      if (error === 'Token expired' && identifierDataField && content?.data && persistanceEntityService) {
        if (refreshToken && refreshTokenAccessTokenIdentifierDataField) {
          const { content: refreshTokenContent, error: refreshTokenError } = await this.verify(
            refreshToken,
            moduleConfig.jwtRefreshSecret
          );
          if (refreshTokenError) {
            errorToThrow = refreshTokenError as Error;
          }
          if (!refreshTokenContent) {
            errorToThrow = new ApplicationError('Empty refresh token.');
          } else {
            const refreshTokenCheckValue = ld.get(content.data, refreshTokenAccessTokenIdentifierDataField);
            if (refreshTokenCheckValue !== refreshToken) {
              errorToThrow = new ApplicationError('Mismatched refresh token.');
            } else {
              forceRenew = false;
              throwError = false;
            }
          }
        } else {
          if (deleteFromStoreIfExpired) {
            const identifierValue = ld.get(content.data, identifierDataField);
            if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
              await persistanceEntityService.delete({
                filters: { [identifierDataField]: identifierValue }
              });
            }
          }
          errorToThrow = new ApplicationError('Expired access token.');
        }
      }
      if (throwError) {
        throw errorToThrow || error;
      }
    }
    // check the content for expiry and renewal
    if (content?.data && forceRenew) {
      const tokenData: TokenManagerCreateData<GenericObject<unknown>> = { ...content.data, type: TokenType.Access };
      if (refreshToken && refreshTokenAccessTokenIdentifierDataField) {
        tokenData[refreshTokenAccessTokenIdentifierDataField] = refreshToken;
      }
      const { result } = await this.create(tokenData as TokenManagerCreateData<TokenEntityFields>, {
        expiresInMinutes: newTokenExpiresInMinutes,
        identifierDataField,
        persist: persistNewToken,
        purgeOldFromPersistance: purgeStoreOnRenew
      });
      newToken = result.token;
    }
    return { content, newToken };
  }

  protected async verify(
    token: string,
    secret: string
  ): Promise<{ content?: DecodedTokenContent<TokenEntityFields>; error?: unknown }> {
    const data = await new Promise<{ content?: DecodedTokenContent<TokenEntityFields>; error?: unknown }>(resolve => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          resolve({ content: decoded as DecodedTokenContent<TokenEntityFields>, error: err });
        }
        resolve({ content: decoded as DecodedTokenContent<TokenEntityFields> });
      });
    });
    return data;
  }
}
