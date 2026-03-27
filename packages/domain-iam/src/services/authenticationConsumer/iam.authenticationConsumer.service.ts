import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService,
  GenericObject,
  HttpMethod,
  LoggerService,
  httpRequest
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMAuthenticationConsumerCompleteData,
  IAMAuthenticationConsumerCompleteOptions,
  IAMAuthenticationConsumerCompleteResult,
  IAMAuthenticationConsumerGetUserAuthenticationConfigResult,
  IAMAuthenticationConsumerInitiateData,
  IAMAuthenticationConsumerInitiateOptions,
  IAMAuthenticationConsumerInitiateResult,
  IAMAuthenticationConsumerRefreshExternalAccessTokenData,
  IAMAuthenticationConsumerRefreshExternalAccessTokenResult
} from './iam.authenticationConsumer.definitions';

import { IAMAuthenticationService } from '../authentication';

/*
 * The base service for integrating authenticationServices via other Node-C Apps as a consumer.
 * This service is intended to be extended by services that will be used in the consumer environment.
 */
export class IAMAuthenticationConsumerService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationService<CompleteContext, InitiateContext> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected serviceName: string
  ) {
    super(configProvider, logger, moduleName);
  }

  async complete(
    data: IAMAuthenticationConsumerCompleteData,
    options: IAMAuthenticationConsumerCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationConsumerCompleteResult> {
    return await this.runRequest<IAMAuthenticationConsumerCompleteResult>('complete', {
      data,
      options
    });
  }

  /*
   * This config is intended for use by the consumer environment.
   * User data from: provider
   * Internal tokens from: provider
   * External tokens from: provider
   * Authentication happens in: provider
   */
  getUserAuthenticationConfig(): IAMAuthenticationConsumerGetUserAuthenticationConfigResult {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    const defaultConfig: IAMAuthenticationConsumerGetUserAuthenticationConfigResult = {
      // this step just extracts the user data from the returned data and saves it in the consumer environment,
      // together with the tokens
      [AppConfigDomainIAMAuthenticationStep.Complete]: {
        authReturnsTokens: true,
        decodeReturnedTokens: true,
        findUser: true,
        findUserBeforeAuth: false,
        findUserInExternalTokenPayloads: true,
        useReturnedTokensAsLocal: true,
        validWithoutUser: false
      },
      // this step simply does nothing
      [AppConfigDomainIAMAuthenticationStep.Initiate]: {
        findUser: false,
        validWithoutUser: true
      }
    };
    return ld.merge(defaultConfig, steps || {});
  }

  async initiate(
    data: IAMAuthenticationConsumerInitiateData,
    options: IAMAuthenticationConsumerInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationConsumerInitiateResult> {
    return await this.runRequest<IAMAuthenticationConsumerInitiateResult>('initiate', {
      data,
      options
    });
  }

  protected async runRequest<ReturnData>(
    endpoint: 'complete' | 'initiate' | 'refreshExternalAccessToken',
    data: GenericObject
  ): Promise<ReturnData> {
    const { configProvider, logger, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { apiKey, apiSecret, apiSecretHashingAlgorithm, baseUrl, ...configData } =
      moduleConfig.authServiceSettings![serviceName].nodeC!;
    const endpointUri = configData[`${endpoint}Endpoint`];
    if (!baseUrl) {
      logger.error(`[${moduleName}][${serviceName}]: Base URL not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    if (!endpointUri) {
      logger.error(`[${moduleName}][${serviceName}]: Endpoint URI not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    const { data: responseData, hasError } = await httpRequest<ReturnData>(`${baseUrl}${endpointUri}`, {
      apiKey,
      apiSecret,
      apiSecretHashingAlgorithm,
      body: data,
      isJSON: true,
      method: HttpMethod.POST
    });
    if (hasError || !responseData) {
      logger.error(`[${moduleName}][${serviceName}]: Endpoint ${endpointUri} failed.`, responseData);
      throw new ApplicationError('Authentication failed.');
    }
    return responseData;
  }

  async refreshExternalAccessToken(
    data: IAMAuthenticationConsumerRefreshExternalAccessTokenData
  ): Promise<IAMAuthenticationConsumerRefreshExternalAccessTokenResult> {
    return await this.runRequest<IAMAuthenticationConsumerRefreshExternalAccessTokenResult>(
      'refreshExternalAccessToken',
      {
        data
      }
    );
  }
}
