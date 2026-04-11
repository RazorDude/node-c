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
  IAMAuthenticationConsumerGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationConsumerGetUserDataFromExternalTokenPayloadsResult,
  IAMAuthenticationConsumerInitiateData,
  IAMAuthenticationConsumerInitiateOptions,
  IAMAuthenticationConsumerInitiateResult,
  IAMAuthenticationConsumerRefreshExternalAccessTokenData,
  IAMAuthenticationConsumerRefreshExternalAccessTokenResult
} from './iam.authenticationConsumer.definitions';

import { IAMAuthenticationService } from '../authentication';

/**
 * The base service for integrating authenticationServices via other Node-C Apps as a consumer.
 *
 * This service is intended to be extended by services that will be used in the consumer environment.
 */
export class IAMAuthenticationConsumerService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationService<CompleteContext, InitiateContext> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, moduleName: string, serviceName: string) {
    super(configProvider, logger, moduleName, serviceName);
    this.isLocal = false;
  }

  async complete(
    data: IAMAuthenticationConsumerCompleteData,
    options: IAMAuthenticationConsumerCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationConsumerCompleteResult> {
    const responseData = await this.runRequest<IAMAuthenticationConsumerCompleteResult>(
      AppConfigDomainIAMAuthenticationStep.Complete,
      {
        auth: { ...data, type: this.serviceName },
        step: AppConfigDomainIAMAuthenticationStep.Complete,
        ...(options?.contextIdentifierField
          ? {
              filters: {
                [options.contextIdentifierField]:
                  options.context[options.contextIdentifierField as keyof CompleteContext]
              }
            }
          : {})
      }
    );
    return {
      ...responseData,
      valid: typeof responseData.valid !== 'undefined' ? responseData.valid : !!responseData.accessToken?.length
    };
  }

  /**
   * This config is intended for use by the consumer environment.
   *
   * User data from: provider
   *
   * Internal tokens from: provider
   *
   * External tokens from: provider
   *
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
        useReturnedTokens: true,
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

  async getUserDataFromExternalTokenPayloads(
    data: IAMAuthenticationConsumerGetUserDataFromExternalTokenPayloadsData
  ): Promise<IAMAuthenticationConsumerGetUserDataFromExternalTokenPayloadsResult | null> {
    const { idTokenPayload } = data;
    if (!idTokenPayload?.data?.user) {
      return null;
    }
    return idTokenPayload.data.user as unknown as IAMAuthenticationConsumerGetUserDataFromExternalTokenPayloadsResult;
  }

  async initiate(
    data: IAMAuthenticationConsumerInitiateData,
    options: IAMAuthenticationConsumerInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationConsumerInitiateResult> {
    const responseData = await this.runRequest<
      IAMAuthenticationConsumerInitiateResult | IAMAuthenticationConsumerCompleteResult
    >(AppConfigDomainIAMAuthenticationStep.Initiate, {
      auth: { ...data, type: this.serviceName },
      step: AppConfigDomainIAMAuthenticationStep.Initiate,
      ...(options?.contextIdentifierField
        ? {
            filters: {
              [options.contextIdentifierField]: options.context[options.contextIdentifierField as keyof InitiateContext]
            }
          }
        : {})
    });
    return {
      ...responseData,
      valid:
        typeof responseData.valid !== 'undefined'
          ? responseData.valid
          : 'accessToken' in responseData && !!responseData.accessToken?.length,
      ...('nextStepsRequired' in responseData && responseData.nextStepsRequired
        ? { mfaUsed: true, mfaValid: true }
        : { mfaUsed: false })
    };
  }

  protected async runRequest<ReturnData>(
    endpoint: AppConfigDomainIAMAuthenticationStep | 'refreshExternalAccessToken',
    data: GenericObject
  ): Promise<ReturnData> {
    const { configProvider, logger, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { apiKey, apiSecret, apiSecretHashingAlgorithm, baseUrl, ...configData } =
      moduleConfig.authServiceSettings![serviceName].nodeC!;
    const endpointMethod = configData[`${endpoint}EndpointMethod`];
    const endpointUri = configData[`${endpoint}Endpoint`];
    if (!baseUrl) {
      logger.error(`[${moduleName}][${serviceName}]: Base URL not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    if (!endpointUri) {
      logger.error(`[${moduleName}][${serviceName}]: Endpoint URI for "${endpoint}" not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    if (!endpointMethod) {
      logger.error(`[${moduleName}][${serviceName}]: Endpoint method for "${endpoint}" not configured.`);
      throw new ApplicationError('Authentication failed.');
    }
    const { data: responseData, hasError } = await httpRequest<ReturnData>(`${baseUrl}${endpointUri}`, {
      apiKey,
      apiSecret,
      apiSecretHashingAlgorithm,
      isJSON: true,
      method: endpointMethod,
      ...(endpointMethod === HttpMethod.GET ? { query: data } : { body: data })
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
