import { ApplicationError, ConfigProviderService } from '@node-c/core';

import {
  IAMMFACompleteData,
  IAMMFACompleteOptions,
  IAMMFACompleteResult,
  IAMMFAInitiateData,
  IAMMFAInitiateOptions,
  IAMMFAInitiateResult
} from './iam.mfa.definitions';

export class IAMMFAService<CompleteContext extends object, InitiateContext extends object = object> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  async complete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMMFACompleteData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMMFACompleteOptions<CompleteContext>
  ): Promise<IAMMFACompleteResult> {
    throw new ApplicationError(`[${this.moduleName}][IAMMFAService]: Method "complete" not implemented.`);
  }

  async initiate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: IAMMFAInitiateData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMMFAInitiateOptions<InitiateContext>
  ): Promise<IAMMFAInitiateResult> {
    throw new ApplicationError(`[${this.moduleName}][IAMMFAService]: Method "initiate" not implemented.`);
  }
}
