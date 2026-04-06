import { ConfigProviderService, LoggerService } from '@node-c/core';

import {
  IAMAuthenticationUserLocalConsumerCompleteData,
  IAMAuthenticationUserLocalConsumerCompleteOptions,
  IAMAuthenticationUserLocalConsumerCompleteResult,
  IAMAuthenticationUserLocalConsumerInitiateData,
  IAMAuthenticationUserLocalConsumerInitiateOptions,
  IAMAuthenticationUserLocalConsumerInitiateResult
} from './iam.authenticationUserLocalConsumer.definitions';

import { IAMAuthenticationConsumerService } from '../authenticationConsumer';

/**
 * A service for integrating UserLocal authentication via other Node-C Apps as a consumer.
 *
 * This service is intended for use by the consumer environment.
 */
export class IAMAuthenticationUserLocalConsumerService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationConsumerService<CompleteContext, InitiateContext> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, moduleName: string, serviceName: string) {
    super(configProvider, logger, moduleName, serviceName);
  }

  async complete(
    data: IAMAuthenticationUserLocalConsumerCompleteData,
    options: IAMAuthenticationUserLocalConsumerCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationUserLocalConsumerCompleteResult> {
    return super.complete(data, options) as Promise<IAMAuthenticationUserLocalConsumerCompleteResult>;
  }

  async initiate(
    data: IAMAuthenticationUserLocalConsumerInitiateData,
    options: IAMAuthenticationUserLocalConsumerInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationUserLocalConsumerInitiateResult> {
    return super.initiate(data, options) as Promise<IAMAuthenticationUserLocalConsumerInitiateResult>;
  }
}
