import {
  AppConfigDomainIAM,
  ApplicationError,
  ConfigProviderService,
  DataEntityService,
  DomainCreateOptions,
  DomainCreateResult,
  DomainEntityService,
  GenericObject
} from '@node-c/core';

import * as jwt from 'jsonwebtoken';
import ld from 'lodash';

import {
  DecodedTokenContent,
  TokenEntity,
  TokenManagerCreateData,
  TokenManagerCreateOptions,
  TokenManagerVerifyResult,
  TokenType,
  VerifyAccessTokenOptions,
  VerifyAccessTokenReturnData
} from './iam.tokenManager.definitions';

import { IAMAuthenticationService, IAMAuthenticationType } from '../authentication';

// TODO: console.error -> logger
/*
 * Service for managing local access and refresh JWTs.
 */
export class IAMTokenManagerService<TokenEntityFields extends object> extends DomainEntityService<
  TokenEntity<TokenEntityFields>,
  DataEntityService<TokenEntity<TokenEntityFields>>
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected authServices: Record<IAMAuthenticationType, IAMAuthenticationService<object, object>>,
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected dataEntityService: DataEntityService<TokenEntity<TokenEntityFields>>,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {
    super(dataEntityService!, ['create', 'delete']);
  }

  async create(
    data: TokenManagerCreateData<TokenEntityFields>,
    options: TokenManagerCreateOptions
  ): Promise<DomainCreateResult<TokenEntity<TokenEntityFields>>> {
    const { configProvider, moduleName, dataEntityService } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { type, ...tokenData } = data;
    const { expiresInMinutes, identifierDataField, persist, purgeOldFromData } = options;
    const signOptions = {} as jwt.SignOptions;
    let secret: string;
    // Leaving this big and ugly if-statement as is, in case we need to expand it in the future.
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
    // save the token in the data system of choice
    // TODO: multi-data isn't handled well here (or, actually, at all)
    if (persist && dataEntityService) {
      if (purgeOldFromData && identifierDataField) {
        const identifierValue = ld.get(data, identifierDataField);
        if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
          await dataEntityService.delete(
            {
              filters: { [identifierDataField]: identifierValue, type }
            },
            { requirePrimaryKeys: false }
          );
        }
      }
      await super.create(objectToSave, { ttl: signOptions.expiresIn } as DomainCreateOptions);
    }
    return { result: objectToSave };
  }

  // TODO: delete from store at the end
  async verifyAccessToken(
    token: string,
    options?: VerifyAccessTokenOptions
  ): Promise<VerifyAccessTokenReturnData<TokenEntityFields>> {
    const { configProvider, moduleName, dataEntityService } = this;
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
    const { content, error, externalTokenData } = await this.verify(token, moduleConfig.jwtAccessSecret, {
      verifyExternal: true
    });
    const externalAccessTokenExpired = !!externalTokenData?.error;
    const internalAccessTokenExpired = error === 'Token expired';
    let errorMessageToLog: string | undefined;
    let externalRenewEnabled = false;
    let newToken: string | undefined;
    let refreshTokenContent: DecodedTokenContent<object> | undefined;
    let renewEnabled = false;
    let throwError = true;
    // check whether the local and/or external access tokens have expired
    if (internalAccessTokenExpired || externalAccessTokenExpired) {
      // prepare renewal if the necessary data is present
      if (identifierDataField && content?.data && dataEntityService) {
        if (refreshToken && refreshTokenAccessTokenIdentifierDataField) {
          // internal refresh token verification
          const { content: rtc, error: refreshTokenError } = await this.verify(
            refreshToken,
            moduleConfig.jwtRefreshSecret
          );
          refreshTokenContent = rtc;
          if (!refreshTokenContent) {
            errorMessageToLog = '[IAMTokenManagerService.verify]: Empty internal refresh token.';
          } else if (refreshTokenError) {
            errorMessageToLog = refreshTokenError as string;
            // delete the refresh token from the store
            if (deleteFromStoreIfExpired && refreshTokenContent.data) {
              const identifierValue = ld.get(refreshTokenContent.data, refreshTokenAccessTokenIdentifierDataField);
              if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
                await dataEntityService.delete(
                  {
                    filters: { [refreshTokenAccessTokenIdentifierDataField]: identifierValue, type: TokenType.Refresh }
                  },
                  { requirePrimaryKeys: false }
                );
              }
            }
          } else {
            const refreshTokenCheckValue = ld.get(content.data, refreshTokenAccessTokenIdentifierDataField);
            if (refreshTokenCheckValue !== refreshToken) {
              errorMessageToLog = '[IAMTokenManagerService.verify]: Mismatched internal refresh token.';
            } else {
              renewEnabled = true;
              throwError = false;
            }
          }
          // external token renewal preparation
          if (externalAccessTokenExpired) {
            if (refreshTokenContent?.data?.externalToken) {
              externalRenewEnabled = true;
              renewEnabled = true;
            } else {
              errorMessageToLog = '[IAMTokenManagerService.verify]: Missing external refresh token.';
            }
          }
        }
        // no renewal - delete from store if enabled and prepare to throw an error
        else {
          if (deleteFromStoreIfExpired) {
            const identifierValue = ld.get(content.data, identifierDataField);
            if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
              await dataEntityService.delete(
                {
                  filters: { [identifierDataField]: identifierValue, type: TokenType.Access }
                },
                { requirePrimaryKeys: false }
              );
            }
          }
        }
      }
      // otherwise, simply throw an error
      else {
        errorMessageToLog = '[IAMTokenManagerService.verify]: Internal access token expired.';
      }
    }
    if (throwError) {
      console.error(errorMessageToLog);
      throw new ApplicationError('Expired access token.');
    }
    // renewal
    if (content?.data && renewEnabled) {
      const tokenData: TokenManagerCreateData<GenericObject<unknown>> = { ...content.data, type: TokenType.Access };
      if (refreshToken && refreshTokenAccessTokenIdentifierDataField) {
        tokenData[refreshTokenAccessTokenIdentifierDataField] = refreshToken;
      }
      if (externalRenewEnabled) {
        const externalAccessTokenRenewalResult = await this.authServices[
          refreshTokenContent!.data!.externalTokenAuthService!
        ].refreshExternalAccessToken({
          accessToken: content.data!.externalToken!,
          refreshToken: refreshTokenContent!.data!.externalToken!
        });
        if (externalAccessTokenRenewalResult.error) {
          // TODO: delete from store
          console.error(errorMessageToLog);
          throw new ApplicationError('Expired access token.');
        }
        // TODO: save the new refresh token, if such exists
        tokenData.externalToken = externalAccessTokenRenewalResult.newAccessToken;
      }
      const { result } = await this.create(tokenData as TokenManagerCreateData<TokenEntityFields>, {
        expiresInMinutes: newTokenExpiresInMinutes,
        identifierDataField,
        persist: persistNewToken,
        purgeOldFromData: purgeStoreOnRenew
      });
      newToken = result.token;
    }
    return { content, newToken };
  }

  protected async verify(
    token: string,
    secret: string,
    options?: { verifyExternal?: boolean }
  ): Promise<TokenManagerVerifyResult<TokenEntityFields>> {
    const { configProvider, moduleName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { verifyExternal } = options || {};
    const data = await new Promise<{ content?: DecodedTokenContent<TokenEntityFields>; error?: unknown }>(resolve => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          resolve({ content: decoded as DecodedTokenContent<TokenEntityFields>, error: err });
        }
        resolve({ content: decoded as DecodedTokenContent<TokenEntityFields> });
      });
    });
    // TODO: move this data to the verifyAccessToken method.
    const returnData: TokenManagerVerifyResult<TokenEntityFields> = { ...data };
    const tokenPayload = data.content?.data;
    if (verifyExternal && tokenPayload?.externalToken && tokenPayload?.externalTokenAuthService) {
      const authServiceConfig = moduleConfig.authServiceSettings?.[tokenPayload?.externalTokenAuthService];
      if (authServiceConfig?.processExternalTokensOnVerify) {
        const authService = this.authServices[tokenPayload?.externalTokenAuthService];
        if (!authService) {
          throw new ApplicationError(
            `[IAMTokenManagerService.verify]: Auth service ${tokenPayload?.externalTokenAuthService} not configured.`
          );
        }
        returnData.externalTokenData = await authService.verifyExternalAccessToken({
          accessToken: tokenPayload?.externalToken
        });
      }
    }
    return returnData;
  }
}
