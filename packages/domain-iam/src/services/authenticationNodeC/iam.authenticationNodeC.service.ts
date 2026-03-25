import {
  AppConfigDomainIAM,
  ApplicationError,
  ConfigProviderService,
  GenericObject,
  HttpMethod,
  LoggerService,
  httpRequest
} from '@node-c/core';

import {
  IAMAuthenticationNodeCCompleteData,
  IAMAuthenticationNodeCCompleteOptions,
  IAMAuthenticationNodeCCompleteResult,
  IAMAuthenticationNodeCInitiateData,
  IAMAuthenticationNodeCInitiateOptions,
  IAMAuthenticationNodeCInitiateResult,
  IAMAuthenticationNodeCRefreshExternalAccessTokenData,
  IAMAuthenticationNodeCRefreshExternalAccessTokenResult
} from './iam.authenticationNodeC.definitions';

import { IAMAuthenticationService } from '../authentication';

/*
 * A service for integrating authenticationServices via other Node-C Apps.
 */
export class IAMAuthenticationNodeCService<
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
    data: IAMAuthenticationNodeCCompleteData,
    options: IAMAuthenticationNodeCCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationNodeCCompleteResult> {
    return await this.runRequest<IAMAuthenticationNodeCCompleteResult>('complete', {
      data,
      options
    });
  }

  async initiate(
    data: IAMAuthenticationNodeCInitiateData,
    options: IAMAuthenticationNodeCInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationNodeCInitiateResult> {
    return await this.runRequest<IAMAuthenticationNodeCInitiateResult>('initiate', {
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
      logger.error(`[${moduleName}][${serviceName}]: Endpoint URi not configured.`);
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
    data: IAMAuthenticationNodeCRefreshExternalAccessTokenData
  ): Promise<IAMAuthenticationNodeCRefreshExternalAccessTokenResult> {
    return await this.runRequest<IAMAuthenticationNodeCRefreshExternalAccessTokenResult>('refreshExternalAccessToken', {
      data
    });
  }
}
