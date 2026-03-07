import crypto from 'crypto';

import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult,
  IAMAuthenticationUserLocalGetUserCreateAccessTokenConfigResult,
  IAMAuthenticationUserLocalInitiateData,
  IAMAuthenticationUserLocalInitiateOptions,
  IAMAuthenticationUserLocalInitiateResult
} from './iam.authenticationUserLocal.definitions';

import { IAMAuthenticationService } from '../authentication';
import { IAMMFAService, IAMMFAType } from '../mfa';

// TODO: add a LocalSecret service to take care of the hashing logic and reuse it here
export class IAMAuthenticationUserLocalService<
  CompleteContext extends object,
  InitiateContext extends object
> extends IAMAuthenticationService<CompleteContext, InitiateContext> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected serviceName: string,
    // eslint-disable-next-line no-unused-vars
    protected mfaServices?: Record<IAMMFAType, IAMMFAService<object, object>>
  ) {
    super(configProvider, moduleName);
  }

  async complete(
    data: IAMAuthenticationUserLocalCompleteData,
    options: IAMAuthenticationUserLocalCompleteOptions<CompleteContext>
  ): Promise<IAMAuthenticationUserLocalCompleteResult> {
    const { configProvider, moduleName, mfaServices, serviceName } = this;
    const { defaultUserIdentifierField } = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { mfaData, mfaType } = data;
    const { context, mfaOptions } = options;
    const userIdentifierField = options.contextIdentifierField || defaultUserIdentifierField;
    const userIdentifierValue = context[userIdentifierField as keyof CompleteContext];
    let mfaUsed = false;
    let mfaValid = false;
    if (mfaType) {
      const mfaService = mfaServices?.[mfaType];
      if (!mfaService) {
        console.error(
          `[${moduleName}][${serviceName}]: Login attempt failed for user "${userIdentifierValue}" - MFA service ${mfaType} not configured.`
        );
        throw new ApplicationError('Authentication failed.');
      }
      if (!mfaData) {
        console.error(
          `[${moduleName}][${serviceName}]: Login attempt failed for user "${userIdentifierValue}" - no MFA data provided.`
        );
        throw new ApplicationError('Authentication failed.');
      }
      const mfaResult = await mfaService.complete(mfaData, { ...(mfaOptions || {}), context });
      mfaUsed = true;
      mfaValid = mfaResult.valid;
    }
    return { mfaUsed, mfaValid, valid: true };
  }

  getUserCreateAccessTokenConfig(): IAMAuthenticationUserLocalGetUserCreateAccessTokenConfigResult {
    const { configProvider, moduleName, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { steps } = moduleConfig.authServiceSettings![serviceName];
    const defaultConfig: IAMAuthenticationUserLocalGetUserCreateAccessTokenConfigResult = {
      [AppConfigDomainIAMAuthenticationStep.Complete]: {
        cache: {
          settings: {
            cacheFieldName: 'userId',
            inputFieldName: 'options.context.id'
          },
          use: {
            options: { overwrite: true, use: true }
          }
        },
        findUser: true,
        findUserBeforeAuth: true,
        validWithoutUser: false
      },
      [AppConfigDomainIAMAuthenticationStep.Initiate]: {
        cache: {
          populate: {
            options: [{ cacheFieldName: 'context', inputFieldName: 'options.context' }]
          },
          settings: {
            cacheFieldName: 'userId',
            inputFieldName: 'options.context.id'
          }
        },
        findUser: true,
        findUserBeforeAuth: true,
        validWithoutUser: false
      }
    };
    return ld.merge(defaultConfig, steps || {});
  }

  async initiate(
    data: IAMAuthenticationUserLocalInitiateData,
    options: IAMAuthenticationUserLocalInitiateOptions<InitiateContext>
  ): Promise<IAMAuthenticationUserLocalInitiateResult> {
    const { configProvider, moduleName, mfaServices, serviceName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { secretKeyHMACAlgorithm, hashingSecret } = moduleConfig.authServiceSettings![serviceName].secretKey!;
    const { mfaData, mfaType, password: authPassword } = data;
    const {
      context,
      context: { password: userPassword },
      mfaOptions
    } = options;
    const userIdentifierField = options.contextIdentifierField || moduleConfig.defaultUserIdentifierField;
    const userIdentifierValue = context[userIdentifierField as keyof InitiateContext];
    let mfaUsed = false;
    let mfaValid = false;
    let wrongPassword = false;
    if (!secretKeyHMACAlgorithm || !hashingSecret || !userPassword) {
      wrongPassword = true;
      console.error(
        `[${moduleName}][${serviceName}]: secretKeyHMACAlgorithm, hashingSecret and/or userPassword not provided.`
      );
    } else {
      const computedPassword = crypto
        .createHmac(secretKeyHMACAlgorithm, hashingSecret)
        .update(`${authPassword}`)
        .digest('hex')
        .toString();
      if (computedPassword !== userPassword) {
        wrongPassword = true;
      }
    }
    if (wrongPassword) {
      console.error(
        `[${moduleName}][${serviceName}]: Login attempt failed for user "${userIdentifierValue}" - wrong password.`
      );
      throw new ApplicationError('Authentication failed.');
    }
    if (mfaType) {
      const mfaService = mfaServices?.[mfaType];
      if (!mfaService) {
        console.error(
          `[${moduleName}][${serviceName}]: Login attempt failed for user "${userIdentifierValue}" - MFA service ${mfaType} not configured.`
        );
        throw new ApplicationError('Authentication failed.');
      }
      if (!mfaData) {
        console.error(
          `[${moduleName}][${serviceName}]: Login attempt failed for user "${userIdentifierValue}" - no MFA data provided.`
        );
        throw new ApplicationError('Authentication failed.');
      }
      const mfaResult = await mfaService.initiate(mfaData, { ...(mfaOptions || {}), context });
      mfaUsed = true;
      mfaValid = mfaResult.valid;
    }
    return { mfaUsed, mfaValid, valid: true };
  }
}
