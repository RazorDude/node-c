import { ApplicationError, ConfigProviderService, LoggerService } from '@node-c/core';

import * as jwt from 'jsonwebtoken';

import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetPayloadsFromExternalTokensData,
  IAMAuthenticationGetPayloadsFromExternalTokensResult,
  IAMAuthenticationGetUserAuthenticationConfigResult,
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult,
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult,
  IAMAuthenticationVerifyExternalAccessTokenData,
  IAMAuthenticationVerifyExternalAccessTokenResult,
  IAMAuthenticationVerifyTokenOptions
} from './iam.authentication.definitions';

import { Constants } from '../../common/definitions';

export class IAMAuthenticationService<CompleteContext extends object, InitiateContext extends object> {
  protected isLocal: boolean;

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected serviceName: string
  ) {}

  /**
   * Step 2 of the authentication process. Mandatory.
   */
  async complete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationCompleteData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMAuthenticationCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationCompleteResult> {
    throw new ApplicationError(`[${this.moduleName}][IAMAuthenticationService]: Method "complete" not implemented.`);
  }

  getUserAuthenticationConfig(): IAMAuthenticationGetUserAuthenticationConfigResult {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "getUserAccessTokenConfig" not implemented.`
    );
  }

  /**
   * Method for decoding JWTs and returning their payloads.
   *
   * If the tokens aren't JWTs, other ways for retreiving the payloads can be implemented, such as the OAuth introspection endpoint.
   */
  async getPayloadsFromExternalTokens(
    data: IAMAuthenticationGetPayloadsFromExternalTokensData
  ): Promise<IAMAuthenticationGetPayloadsFromExternalTokensResult> {
    const { logger, moduleName, serviceName } = this;
    const { accessToken, idToken } = data;
    const returnData: IAMAuthenticationGetPayloadsFromExternalTokensResult = {};
    if (accessToken) {
      const { content: accessTokenPayload, error } = await this.verifyToken(accessToken);
      if (error) {
        logger.error(
          `[${moduleName}][${serviceName}]: Method "getPayloadsFromExternalTokens" has produced an error:`,
          error
        );
        throw new ApplicationError(`[${moduleName}][${serviceName}]: Error getting data from external tokens.`);
      }
      returnData.accessTokenPayload = accessTokenPayload;
    }
    if (idToken) {
      const idTokenData = await this.verifyToken(idToken);
      returnData.idTokenPayload = idTokenData.content;
    }
    return returnData;
  }

  /**
   * Method for mapping token payload data, such as username and scopes, to local user data, such as email and roles.
   */
  async getUserDataFromExternalTokenPayloads(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationGetUserDataFromExternalTokenPayloadsData
  ): Promise<IAMAuthenticationGetUserDataFromExternalTokenPayloadsResult | null> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "getUserDataFromExternalTokenPayloads" not implemented.`
    );
  }

  /**
   * Step 1 of the authentication process. Mandatory.
   */
  async initiate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationInitiateData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMAuthenticationInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationInitiateResult> {
    throw new ApplicationError(`[${this.moduleName}][IAMAuthenticationService]: Method "initiate" not implemented.`);
  }

  async refreshExternalAccessToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationRefreshExternalAccessTokenData
  ): Promise<IAMAuthenticationRefreshExternalAccessTokenResult> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "refreshExternalAccessToken" not implemented.`
    );
  }

  async verifyExternalAccessToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationVerifyExternalAccessTokenData
  ): Promise<IAMAuthenticationVerifyExternalAccessTokenResult> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "verifyExternalAccessToken" not implemented.`
    );
  }

  async verifyToken<DecodedTokenContent = unknown>(
    token: string,
    options?: IAMAuthenticationVerifyTokenOptions
  ): Promise<{ content?: DecodedTokenContent; error?: unknown }> {
    const { audiences, issuer, secret } = options || {};
    let returnData: { content?: DecodedTokenContent; error?: unknown } = {};
    if (secret) {
      returnData = await new Promise<{ content?: DecodedTokenContent; error?: unknown }>(resolve => {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) {
            resolve({ content: decoded as DecodedTokenContent, error: err });
          }
          resolve({ content: decoded as DecodedTokenContent });
        });
      });
    } else {
      const tokenContent = jwt.decode(token) as DecodedTokenContent & { aud?: string; exp?: number; iss?: string };
      if (tokenContent.exp) {
        // tokenContent.exp < new Date().valueOf()
        let currentTimeStamp = `${new Date().valueOf()}`;
        let expString = `${tokenContent.exp}`;
        if (expString.length < currentTimeStamp.length) {
          currentTimeStamp = currentTimeStamp.substring(0, expString.length);
        } else if (expString.length > currentTimeStamp.length) {
          expString = expString.substring(0, currentTimeStamp.length);
        }
        if (parseInt(expString, 10) < parseInt(currentTimeStamp, 10)) {
          returnData.error = Constants.TOKEN_EXPIRED_ERROR;
        }
      }
      if (tokenContent.aud && audiences && !audiences.includes(tokenContent.aud)) {
        returnData.error = Constants.TOKEN_MISMATCHED_AUDIENCES_ERROR;
      }
      if (tokenContent.iss && issuer && issuer !== tokenContent.iss) {
        returnData.error = Constants.TOKEN_MISMATCHED_ISSUER_ERROR;
      }
      returnData.content = tokenContent;
    }
    return returnData;
  }
}
