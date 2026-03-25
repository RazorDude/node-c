import {
  AppConfigDomainIAM,
  ApplicationError,
  ConfigProviderService,
  DataEntityService,
  DomainCreatePrivateOptions,
  DomainCreateResult,
  DomainEntityService,
  GenericObject,
  LoggerService,
  setNested
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

import { Constants } from '../../common/definitions';
import { IAMAuthenticationService, IAMAuthenticationType } from '../authentication';
import { IAMAuthenticationOAuth2Service } from '../authenticationOAuth2';
import { IAMAuthenticationUserLocalService } from '../authenticationUserLocal';

/*
 * Service for managing local access and refresh JWTs.
 */
export class IAMTokenManagerService<TokenEntityFields extends object> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    // protected authServices: Record<string, IAMAuthenticationService<object, object>>,
    // eslint-disable-next-line no-unused-vars
    protected authServices: {
      [IAMAuthenticationType.OAuth2]?: IAMAuthenticationOAuth2Service<object, object>;
      [IAMAuthenticationType.UserLocal]?: IAMAuthenticationUserLocalService<object, object>;
    } & { [serviceName: string]: IAMAuthenticationService<object, object> },
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    public domainTokensEntityService: DomainEntityService<
      TokenEntity<TokenEntityFields>,
      DataEntityService<TokenEntity<TokenEntityFields>>
    >,
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  async create(
    data: TokenManagerCreateData<TokenEntityFields>,
    options: TokenManagerCreateOptions
  ): Promise<DomainCreateResult<TokenEntity<TokenEntityFields>>> {
    const { configProvider, logger, moduleName, domainTokensEntityService } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { type, ...tokenData } = data;
    const {
      expiresInMinutes,
      identifierDataField,
      persist,
      purgeOldFromData,
      tokenContentOnlyFields,
      useExternalTokenAsLocal
    } = options;
    const signOptions = {} as jwt.SignOptions;
    let secret: string;
    // access token options
    if (type === TokenType.Access) {
      secret = moduleConfig.jwtAccessSecret;
      if (expiresInMinutes) {
        signOptions.expiresIn = expiresInMinutes * 60;
      } else if (moduleConfig.accessTokenExpiryTimeInMinutes) {
        signOptions.expiresIn = moduleConfig.accessTokenExpiryTimeInMinutes * 60;
      }
    }
    // id token options: this intentionally uses the jwtAccessSecret and the jwtRefreshTokenExpiryTimeInMinutes
    else if (type === TokenType.Id) {
      secret = moduleConfig.jwtAccessSecret;
      if (expiresInMinutes) {
        signOptions.expiresIn = expiresInMinutes * 60;
      } else if (moduleConfig.refreshTokenExpiryTimeInHours) {
        signOptions.expiresIn = moduleConfig.refreshTokenExpiryTimeInHours * 60 * 60;
      }
    }
    // refresh token options
    else if (type === TokenType.Refresh) {
      secret = moduleConfig.jwtRefreshSecret;
      if (expiresInMinutes) {
        signOptions.expiresIn = expiresInMinutes * 60;
      } else if (moduleConfig.refreshTokenExpiryTimeInHours) {
        signOptions.expiresIn = moduleConfig.refreshTokenExpiryTimeInHours * 60 * 60;
      }
    } else {
      throw new ApplicationError(`[TokenManager.create]: Invalid token type - "${type}".`);
    }
    let token: string;
    if (useExternalTokenAsLocal) {
      if (!data.externalToken) {
        throw new ApplicationError(
          '[TokenManager.create]: An externalToken is required when useExternalTokenAsLocal is set to true.'
        );
      }
      token = data.externalToken;
    } else {
      token = await new Promise<string>((resolve, reject) => {
        jwt.sign({ data }, secret, signOptions, (err, token) => {
          if (err) {
            logger.error(err);
            reject(new ApplicationError('Failed to sign token.'));
            return;
          }
          resolve(token as string);
        });
      });
    }
    const objectToSave = { ...tokenData, token, type } as TokenEntity<TokenEntityFields>;
    if (tokenContentOnlyFields?.length) {
      tokenContentOnlyFields.forEach(fieldName =>
        setNested(objectToSave, fieldName, undefined, { removeNestedFieldEscapeSign: true })
      );
    }
    // save the token in the data system of choice
    // TODO: multi-data isn't handled well here (or, actually, at all)
    if (persist) {
      if (purgeOldFromData && identifierDataField) {
        const identifierValue = ld.get(data, identifierDataField);
        if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
          await domainTokensEntityService.delete(
            {
              filters: { [identifierDataField]: identifierValue, type }
            },
            { requirePrimaryKeys: true }
          );
        }
      }
      await domainTokensEntityService.create(objectToSave, {}, {
        ttl: signOptions.expiresIn
      } as DomainCreatePrivateOptions);
    }
    return { result: objectToSave };
  }

  async verifyAccessToken(
    token: string,
    options?: VerifyAccessTokenOptions
  ): Promise<VerifyAccessTokenReturnData<TokenEntityFields>> {
    const { configProvider, domainTokensEntityService, logger, moduleName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const {
      deleteFromStoreIfExpired,
      identifierDataField,
      newAccessTokenExpiresInMinutes,
      persistNewToken,
      purgeStoreOnRenew,
      refreshToken,
      refreshTokenAccessTokenIdentifierDataField
    } = options || {};
    // decode the token
    const { error, externalTokenData, ...accessTokenData } = await this.verify(token, moduleConfig.jwtAccessSecret, {
      // TODO: make this configurable
      verifyExternal: true
    });
    const externalAccessTokenExpired = !!externalTokenData?.error;
    const internalAccessTokenExpired = error === Constants.TOKEN_EXPIRED_ERROR;
    let content = accessTokenData.content;
    let errorMessageToLog: string | undefined;
    let externalRenewEnabled = false;
    let newAccessToken: string | undefined;
    let newIdToken: string | undefined;
    let newRefreshToken: string | undefined;
    let refreshTokenContent: DecodedTokenContent<object> | undefined;
    let renewEnabled = false;
    let throwError = true;
    // check whether the local and/or external access tokens have expired
    if (internalAccessTokenExpired || externalAccessTokenExpired) {
      // prepare renewal if the necessary data is present
      if (identifierDataField && content?.data) {
        if (refreshToken && refreshTokenAccessTokenIdentifierDataField) {
          // internal refresh token verification
          const { content: rtc, error: refreshTokenError } = await this.verify(
            refreshToken,
            moduleConfig.jwtRefreshSecret
          );
          refreshTokenContent = rtc;
          if (!refreshTokenContent) {
            errorMessageToLog = '[IAMTokenManagerService.verifyAccessToken]: Empty internal refresh token.';
          } else if (refreshTokenError) {
            errorMessageToLog = refreshTokenError as string;
            // delete the refresh token from the store
            if (deleteFromStoreIfExpired && refreshTokenContent.data) {
              const identifierValue = ld.get(refreshTokenContent.data, refreshTokenAccessTokenIdentifierDataField);
              if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
                await domainTokensEntityService.delete(
                  {
                    filters: { [refreshTokenAccessTokenIdentifierDataField]: identifierValue, token: refreshToken }
                  },
                  { requirePrimaryKeys: true }
                );
              }
            }
          } else {
            const refreshTokenCheckValue = ld.get(content.data, refreshTokenAccessTokenIdentifierDataField);
            if (refreshTokenCheckValue !== refreshToken) {
              errorMessageToLog = '[IAMTokenManagerService.verifyAccessToken]: Mismatched internal refresh token.';
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
              throwError = false;
            } else {
              errorMessageToLog = '[IAMTokenManagerService.verifyAccessToken]: Missing external refresh token.';
            }
          }
        }
        // no renewal - delete from store if enabled and prepare to throw an error
        else {
          errorMessageToLog =
            '[IAMTokenManagerService.verifyAccessToken]: Access token expired & no refresh token data present or configured.';
          if (deleteFromStoreIfExpired) {
            const identifierValue = ld.get(content.data, identifierDataField);
            if (typeof identifierValue !== 'undefined' && typeof identifierValue !== 'object') {
              await domainTokensEntityService.delete(
                {
                  filters: { [identifierDataField]: identifierValue, token }
                },
                { requirePrimaryKeys: true }
              );
            }
          }
        }
      }
      // otherwise, simply throw an error
      else {
        errorMessageToLog = '[IAMTokenManagerService.verify]: Internal access token expired.';
      }
    } else {
      // check whether the local access token exists in the cache
      if (moduleConfig.checkAccessTokenExistanceLocally) {
        if (!identifierDataField) {
          errorMessageToLog =
            'The identifierDataField is required when checkAccessTokenExistanceLocally is set to true.';
          throwError = true;
        } else if (!content?.data) {
          errorMessageToLog = 'Content.data is required when checkAccessTokenExistanceLocally is set to true.';
          throwError = true;
        } else {
          const accessTokenResult = await this.domainTokensEntityService.findOne({
            filters: { [identifierDataField]: ld.get(content.data, identifierDataField), token, type: TokenType.Access }
          });
          if (!accessTokenResult.result) {
            errorMessageToLog = 'Access token not found locally.';
            throwError = true;
          } else {
            throwError = false;
          }
        }
      } else {
        throwError = false;
      }
    }
    if (throwError) {
      logger.error(errorMessageToLog);
      throw new ApplicationError('Expired access token.');
    }
    if (content?.data) {
      let idTokenContent: DecodedTokenContent<TokenEntityFields> | undefined;
      let identifierValue: unknown | undefined;
      // find and decode the id token, and add its data to the content
      if (identifierDataField) {
        identifierValue = ld.get(content.data, identifierDataField);
        const idToken = await this.domainTokensEntityService.findOne({
          filters: { [identifierDataField]: identifierValue, token, type: TokenType.Id }
        });
        if (idToken.result) {
          const idTokenData = await this.verify(idToken.result.token, moduleConfig.jwtAccessSecret);
          if (idTokenData.content) {
            idTokenContent = idTokenData.content;
            content = ld.merge(content, idTokenContent);
          }
        }
      }
      // renewal
      if (renewEnabled) {
        const tokenData: TokenManagerCreateData<GenericObject<unknown>> = { ...content.data, type: TokenType.Access };
        const refreshTokenData: TokenManagerCreateData<GenericObject<unknown>> = {
          ...refreshTokenContent?.data,
          type: TokenType.Access
        };
        if (refreshToken && refreshTokenAccessTokenIdentifierDataField) {
          tokenData[refreshTokenAccessTokenIdentifierDataField] = refreshToken;
        }
        // renew the external access token, if enabled
        if (externalRenewEnabled) {
          const externalAccessTokenRenewalResult = await this.authServices[
            refreshTokenContent!.data!.externalTokenAuthService!
          ]!.refreshExternalAccessToken({
            accessToken: content.data!.externalToken!,
            refreshToken: refreshTokenContent!.data!.externalToken!
          });
          if (externalAccessTokenRenewalResult.error) {
            // TODO: delete the old token from store
            logger.error(errorMessageToLog);
            throw new ApplicationError('Expired access token.');
          }
          tokenData.externalToken = externalAccessTokenRenewalResult.newAccessToken;
          if (externalAccessTokenRenewalResult.newRefreshToken) {
            refreshTokenData.externalToken = externalAccessTokenRenewalResult.newRefreshToken;
          }
        }
        // renew the internal access tokens
        const { result } = await this.create(tokenData as TokenManagerCreateData<TokenEntityFields>, {
          expiresInMinutes: newAccessTokenExpiresInMinutes,
          identifierDataField,
          persist: persistNewToken,
          purgeOldFromData: purgeStoreOnRenew,
          tokenContentOnlyFields: ['externalToken']
        });
        newAccessToken = result.token;
        refreshTokenData.accessToken = newAccessToken;
        // renew the internal refreshToken
        const { result: refreshTokenResult } = await this.create(
          refreshTokenData as TokenManagerCreateData<TokenEntityFields>,
          {
            expiresInMinutes: newAccessTokenExpiresInMinutes,
            identifierDataField,
            persist: persistNewToken,
            purgeOldFromData: purgeStoreOnRenew,
            tokenContentOnlyFields: ['accessToken', 'externalToken']
          }
        );
        newRefreshToken = refreshTokenResult.token;
        // renew the internal idToken
        if (idTokenContent?.data) {
          const { result: newIdTokenResult } = await this.create(
            {
              ...idTokenContent.data,
              accessToken: newAccessToken,
              type: TokenType.Id,
              [identifierDataField!]: identifierValue
            } as TokenEntityFields,
            {
              expiresInMinutes: newAccessTokenExpiresInMinutes,
              identifierDataField,
              persist: true,
              purgeOldFromData: true,
              tokenContentOnlyFields: [...Object.keys(idTokenContent.data), 'accessToken']
            }
          );
          newIdToken = newIdTokenResult.token;
        }
      }
    }
    return { content, newAccessToken, newRefreshToken, newIdToken };
  }

  protected async verify(
    token: string,
    secret: string,
    options?: { forceVerifyExternal?: boolean; verifyExternal?: boolean }
  ): Promise<TokenManagerVerifyResult<TokenEntityFields>> {
    const { configProvider, moduleName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { forceVerifyExternal, verifyExternal } = options || {};
    const data = await new Promise<{ content?: DecodedTokenContent<TokenEntityFields>; error?: unknown }>(resolve => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          resolve({ content: decoded as DecodedTokenContent<TokenEntityFields>, error: err });
        }
        resolve({ content: decoded as DecodedTokenContent<TokenEntityFields> });
      });
    });
    // TODO: move this logic to the verifyAccessToken method.
    const returnData: TokenManagerVerifyResult<TokenEntityFields> = { ...data };
    const tokenPayload = data.content?.data;
    if (verifyExternal && tokenPayload?.externalToken && tokenPayload?.externalTokenAuthService) {
      const authServiceConfig = moduleConfig.authServiceSettings?.[tokenPayload?.externalTokenAuthService];
      if (authServiceConfig?.processExternalTokensOnVerify || forceVerifyExternal) {
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
