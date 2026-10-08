/** biome-ignore-all lint/suspicious/useAwait: Abstract methods. */

import {
  ApplicationError,
  ConfigProviderService,
  LoggerService
} from '@node-c/core';

import {
  IAMMFACompleteData,
  IAMMFACompleteOptions,
  IAMMFACompleteResult,
  IAMMFAInitiateData,
  IAMMFAInitiateOptions,
  IAMMFAInitiateResult
} from './iam.mfa.definitions.js';

// TODO: local MFA implementation
export class IAMMFAService<
  CompleteContext extends object,
  InitiateContext extends object = object
> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected logger: LoggerService,
    protected moduleName: string
  ) {}

  async complete(
    _data: IAMMFACompleteData,
    _options: IAMMFACompleteOptions<CompleteContext>
  ): Promise<IAMMFACompleteResult> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMMFAService]: Method "complete" not implemented.`
    );
  }

  async initiate(
    _data: IAMMFAInitiateData,
    _options: IAMMFAInitiateOptions<InitiateContext>
  ): Promise<IAMMFAInitiateResult> {
    throw new ApplicationError(
      `[${this.moduleName}][IAMMFAService]: Method "initiate" not implemented.`
    );
  }
}
