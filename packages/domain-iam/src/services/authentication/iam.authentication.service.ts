import { ApplicationError, ConfigProviderService } from '@node-c/core';

import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetPayloadsFromExternalTokensData,
  IAMAuthenticationGetPayloadsFromExternalTokensResult,
  IAMAuthenticationGetUserCreateAccessTokenConfigResult,
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult,
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult,
  IAMAuthenticationVerifyExternalAccessTokenData,
  IAMAuthenticationVerifyExternalAccessTokenResult
} from './iam.authentication.definitions';

export class IAMAuthenticationService<CompleteContext extends object, InitiateContext extends object> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  /*
   * Step 2 of the auth process. Mandatory.
   */
  async complete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationCompleteData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMAuthenticationCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationCompleteResult> {
    throw new ApplicationError(`[${this.moduleName}][IAMAuthenticationService]: Method "complete" not implemented.`);
  }

  getUserCreateAccessTokenConfig(): IAMAuthenticationGetUserCreateAccessTokenConfigResult {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "getUserAccessTokenConfig" not implemented.`
    );
  }

  /*
   * Method for decoding JWTs and returning their payloads.
   * If the tokens aren't JWTs, other ways for retreiving the payloads can be implemented, such as the OAuth introspection endpoint.
   */
  async getPayloadsFromExternalTokens(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationGetPayloadsFromExternalTokensData
  ): Promise<IAMAuthenticationGetPayloadsFromExternalTokensResult> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "getPayloadsFromExternalTokens" not implemented.`
    );
  }

  /*
   * Method for mapping token payload data, such as username and scopes, to local user data, such as email and roles.
   */
  async getUserDataFromExternalTokenPayloads(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationGetUserDataFromExternalTokenPayloadsData
  ): Promise<unknown> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "getUserDataFromExternalTokenPayloads" not implemented.`
    );
  }

  /*
   * Step 1 of the auth process. Mandatory.
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
}
