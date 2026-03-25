import { ConfigProviderService, LoggerService } from '@node-c/core';

import {
  IAMAuthenticationUserLocalNodeCCompleteData,
  IAMAuthenticationUserLocalNodeCCompleteOptions,
  IAMAuthenticationUserLocalNodeCCompleteResult,
  IAMAuthenticationUserLocalNodeCInitiateData,
  IAMAuthenticationUserLocalNodeCInitiateOptions,
  IAMAuthenticationUserLocalNodeCInitiateResult
} from './iam.authenticationUserLocalNodeC.definitions';

import { IAMAuthenticationNodeCService } from '../authenticationNodeC';

/*
 * A service for integrating UserLocal auth via other Node-C Apps.
 */
export class IAMAuthenticationUserLocalNodeCService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationNodeCService<CompleteContext, InitiateContext> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, moduleName: string, serviceName: string) {
    super(configProvider, logger, moduleName, serviceName);
  }

  async complete(
    data: IAMAuthenticationUserLocalNodeCCompleteData,
    options: IAMAuthenticationUserLocalNodeCCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationUserLocalNodeCCompleteResult> {
    return super.complete(data, options) as Promise<IAMAuthenticationUserLocalNodeCCompleteResult>;
  }

  async initiate(
    data: IAMAuthenticationUserLocalNodeCInitiateData,
    options: IAMAuthenticationUserLocalNodeCInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationUserLocalNodeCInitiateResult> {
    return super.initiate(data, options) as Promise<IAMAuthenticationUserLocalNodeCInitiateResult>;
  }
}
