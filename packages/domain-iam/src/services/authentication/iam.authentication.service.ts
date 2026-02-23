import { ApplicationError, ConfigProviderService } from '@node-c/core';

import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetUserCreateAccessTokenConfigResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult
} from './iam.authentication.definitions';

export class IAMAuthenticationService<CompleteContext extends object, InitiateContext extends object> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

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

  async getPayloadsFromTokens(): Promise<void> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "getPayloadsFromTokens" not implemented.`
    );
  }

  async getUserDataFromTokenPayloads(): Promise<void> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "getUserDataFromTokenPayloads" not implemented.`
    );
  }

  async initiate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMAuthenticationInitiateData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMAuthenticationInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationInitiateResult> {
    throw new ApplicationError(`[${this.moduleName}][IAMAuthenticationService]: Method "initiate" not implemented.`);
  }

  async refreshAccessToken(): Promise<void> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMAuthenticationService]: Method "refreshAccessToken" not implemented.`
    );
  }
}
