import {
  AppConfigDomainIAM,
  ApplicationError,
  ConfigProviderService,
  DomainEntityService,
  PersistanceEntityService
} from '@node-c/core';

import { getNested } from '@ramster/general-tools';
import * as jwt from 'jsonwebtoken';

import {
  CreateAccessTokenOptions,
  CreateRefreshTokenOptions,
  DecodedTokenContent,
  StoredToken,
  TokenType,
  VerifyAccessTokenOptions,
  VerifyAccessTokenReturnData
} from './iam.tokenManager.definitions';

// TODO: console.error -> logger
// TODO: check whether the JWT library actually computes the hash of the content
export class IAMTokenManagerService<StoredTokenFields, AccessTokenData, RefreshTokenData> extends DomainEntityService<
  StoredToken<StoredTokenFields>,
  PersistanceEntityService<StoredToken<StoredTokenFields>>
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected persistanceEntityService: PersistanceEntityService<StoredToken<StoredTokenFields>>
  ) {
    super(persistanceEntityService!);
  }

  // async create(
  //   data: StoredToken<StoredTokenFields>,
  //   options?: CreateAccessTokenOptions
  // ): Promise<StoredToken<StoredTokenFields>> {
  //   const { configProvider, moduleName } = this;
  //   const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
  //   const { expiresInMinutes, identifierDataField, persist, purgeOldFromPersistance } = options || {};
  //   const signOptions = {} as jwt.SignOptions;
  //   if (expiresInMinutes) {
  //     signOptions.expiresIn = expiresInMinutes * 60;
  //   } else if (moduleConfig.accessTokenExpiryTimeInMinutes) {
  //     signOptions.expiresIn = moduleConfig.accessTokenExpiryTimeInMinutes * 60;
  //   }
  //   return {
  //     result: await this.createToken<AccessTokenData>(data, {
  //       identifierDataField,
  //       persist,
  //       purgeOldFromPersistance,
  //       secret: moduleConfig.jwtAccessSecret,
  //       signOptions,
  //       type: TokenType.Access
  //     })
  //   };
  // }

  async createAccessToken(data: AccessTokenData, options?: CreateAccessTokenOptions): Promise<string> {
    const { configProvider, moduleName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { expiresInMinutes, identifierDataField, persist, purgeOldFromPersistance } = options || {};
    const signOptions = {} as jwt.SignOptions;
    if (expiresInMinutes) {
      signOptions.expiresIn = expiresInMinutes * 60;
    } else if (moduleConfig.accessTokenExpiryTimeInMinutes) {
      signOptions.expiresIn = moduleConfig.accessTokenExpiryTimeInMinutes * 60;
    }
    return await this.createToken<AccessTokenData>(data, {
      identifierDataField,
      persist,
      purgeOldFromPersistance,
      secret: moduleConfig.jwtAccessSecret,
      signOptions,
      type: TokenType.Access
    });
  }

  async createRefreshToken(data: RefreshTokenData, options?: CreateRefreshTokenOptions): Promise<string> {
    const { configProvider, moduleName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { expiresInMinutes, identifierDataField, persist, purgeOldFromPersistance } = options || {};
    const signOptions = {} as jwt.SignOptions;
    if (expiresInMinutes) {
      signOptions.expiresIn = expiresInMinutes * 60;
    } else if (moduleConfig.refreshTokenExpiryTimeInMinutes) {
      signOptions.expiresIn = moduleConfig.refreshTokenExpiryTimeInMinutes * 60;
    }
    return await this.createToken<RefreshTokenData>(data, {
      identifierDataField,
      persist,
      purgeOldFromPersistance,
      secret: moduleConfig.jwtRefreshSecret,
      signOptions,
      type: TokenType.Refresh
    });
  }

  protected async createToken<TokenData>(
    data: TokenData,
    options: {
      identifierDataField?: string;
      persist?: boolean;
      purgeOldFromPersistance?: boolean;
      secret: string;
      signOptions: jwt.SignOptions;
      type: TokenType;
    }
  ): Promise<string> {
    const { persistanceEntityService } = this;
    const { identifierDataField, persist, purgeOldFromPersistance, secret, signOptions, type } = options;
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
    // save the token in the persistance system of choice
    if (persist && persistanceEntityService) {
      if (purgeOldFromPersistance && identifierDataField) {
        const identifierValue = getNested(data, identifierDataField);
        if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
          await persistanceEntityService.delete({
            filters: { [identifierDataField]: identifierValue }
          });
        }
      }
      await persistanceEntityService.create({ ...data, token, type } as unknown as StoredToken<StoredTokenFields>);
    }
    return token;
  }

  async verifyAccessToken(
    token: string,
    options?: VerifyAccessTokenOptions
  ): Promise<VerifyAccessTokenReturnData<AccessTokenData>> {
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
    const { content, error } = await this.verifyToken<AccessTokenData>(token, moduleConfig.jwtAccessSecret);
    let forceRenew = true;
    let newToken: string | undefined;
    // check for errors
    if (error) {
      let errorToThrow: Error | undefined;
      let throwError = true;
      if (error === 'Token expired' && identifierDataField && content?.data && persistanceEntityService) {
        if (refreshToken && refreshTokenAccessTokenIdentifierDataField) {
          const { content: refreshTokenContent, error: refreshTokenError } = await this.verifyToken(
            refreshToken,
            moduleConfig.jwtRefreshSecret
          );
          if (refreshTokenError) {
            errorToThrow = refreshTokenError as Error;
          }
          if (!refreshTokenContent) {
            errorToThrow = new ApplicationError('Empty refresh token.');
          } else {
            const refreshTokenCheckValue = getNested(content.data, refreshTokenAccessTokenIdentifierDataField);
            if (refreshTokenCheckValue !== refreshToken) {
              errorToThrow = new ApplicationError('Mismatched refresh token.');
            } else {
              forceRenew = false;
              throwError = false;
            }
          }
        } else {
          if (deleteFromStoreIfExpired) {
            const identifierValue = getNested(content.data, identifierDataField);
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
      const tokenData: Record<string, unknown> = { ...content.data };
      if (refreshToken && refreshTokenAccessTokenIdentifierDataField) {
        tokenData[refreshTokenAccessTokenIdentifierDataField] = refreshToken;
      }
      newToken = await this.createAccessToken(tokenData as AccessTokenData, {
        expiresInMinutes: newTokenExpiresInMinutes,
        identifierDataField,
        persist: persistNewToken,
        purgeOldFromPersistance: purgeStoreOnRenew
      });
    }
    return { content, newToken };
  }

  protected async verifyToken<TokenData>(
    token: string,
    secret: string
  ): Promise<{ content?: DecodedTokenContent<TokenData>; error?: unknown }> {
    const data = await new Promise<{ content?: DecodedTokenContent<TokenData>; error?: unknown }>(resolve => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          resolve({ content: decoded as DecodedTokenContent<TokenData>, error: err });
        }
        resolve({ content: decoded as DecodedTokenContent<TokenData> });
      });
    });
    return data;
  }
}
