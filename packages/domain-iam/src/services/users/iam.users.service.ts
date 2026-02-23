import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService,
  DataEntityService,
  DataFindOneOptions,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainMethod,
  GenericObject,
  getNested,
  setNested
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMUsersCreateAccessTokenOptions,
  IAMUsersCreateAccessTokenReturnData,
  IAMUsersExecuteStepData,
  IAMUsersExecuteStepOptions,
  IAMUsersExecuteStepResult,
  IAMUsersGetUserWithPermissionsDataOptions,
  IAMUsersUserTokenEnityFields,
  IAMUsersUserTokenUserIdentifier,
  IAMUsersUserWithPermissionsData
} from './iam.users.definitions';

import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationService,
  IAMAuthenticationType
} from '../authentication';
import { IAMAuthenticationOAuth2CompleteResult } from '../authenticationOAuth2';
import { IAMTokenManagerService, TokenType } from '../tokenManager';

// TODO: create user (signup); this should include password hashing
// TODO: update password (incl. hashing)
// TODO: reset password
// TODO: console.info -> logger
export class IAMUsersService<
  User extends object,
  Data extends DomainEntityServiceDefaultData<Partial<User>> = DomainEntityServiceDefaultData<Partial<User>>
> extends DomainEntityService<
  User,
  DataEntityService<User>,
  Data,
  Record<string, DataEntityService<Partial<User>>> | undefined
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected dataUsersService: DataEntityService<User>,
    // eslint-disable-next-line no-unused-vars
    protected dataUsersAuthCacheService: DataEntityService<GenericObject>,
    // eslint-disable-next-line no-unused-vars
    protected tokenManager: IAMTokenManagerService<IAMUsersUserTokenEnityFields>,
    // eslint-disable-next-line no-unused-vars
    protected userAuthServices: Record<IAMAuthenticationType, IAMAuthenticationService<User, User>>,
    protected defaultMethods: string[] = [
      DomainMethod.BulkCreate,
      DomainMethod.Create,
      DomainMethod.Delete,
      DomainMethod.Find,
      DomainMethod.FindOne,
      DomainMethod.Update
    ],
    protected additionalDataEntityServices?: Record<string, DataEntityService<Partial<User>>>
  ) {
    super(dataUsersService, defaultMethods, additionalDataEntityServices);
  }

  async createAccessToken<AuthData = unknown>(
    options: IAMUsersCreateAccessTokenOptions<AuthData>
  ): Promise<IAMUsersCreateAccessTokenReturnData<User>> {
    const { configProvider, moduleName } = this;
    const { accessTokenExpiryTimeInMinutes, defaultUserIdentifierField, refreshTokenExpiryTimeInMinutes } =
      configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const {
      auth: { type: authType },
      rememberUser
    } = options;
    console.info(`[Domain.${moduleName}.Users]: Login attempt started.`);
    // 1. Make sure the auth service actually exists - local, oauth2, etc.
    const authService = this.userAuthServices[authType];
    if (!authService) {
      console.info(`[Domain.${moduleName}.Users]: No authService ${authType} found.`);
      throw new ApplicationError('Authentication failed.');
    }
    // 2. Get the user-specific configuration from the authService
    const authServiceBehaviorConfig = authService.getUserCreateAccessTokenConfig();
    let issueTokens = false;
    let step: AppConfigDomainIAMAuthenticationStep;
    // 3. Prepare the step behavior based on the configuration
    // 3.1. Complete step
    if (options.step === AppConfigDomainIAMAuthenticationStep.Complete) {
      issueTokens = true;
      step = AppConfigDomainIAMAuthenticationStep.Complete;
    }
    // 3.2. Initialize step - assumed implicitly
    else {
      step = AppConfigDomainIAMAuthenticationStep.Initialize;
    }
    let stepConfig = authServiceBehaviorConfig[step];
    // 3. Run the authentication method itself.
    let { stepResult, user } = await this.executeStep(options, { authService, name: step, stepConfig });
    let userFilterField: string | undefined;
    let userFilterValue: unknown | undefined;
    // 4. Run the final step, if this is the first step no mfa has been used
    if (step === AppConfigDomainIAMAuthenticationStep.Initialize && !stepResult.mfaUsed) {
      issueTokens = true;
      step = AppConfigDomainIAMAuthenticationStep.Complete;
      stepConfig = authServiceBehaviorConfig[step];
      const finalStepData = await this.executeStep(options, { authService, name: step, stepConfig });
      stepResult = finalStepData.stepResult;
      user = user ?? finalStepData.user;
      userFilterField = finalStepData.userFilterField;
      userFilterValue = finalStepData.userFilterValue;
    }
    // 5. Token management. In this case, we will definitely have the user.
    if (issueTokens) {
      const { findUser } = stepConfig;
      if (!findUser) {
        console.info(
          `[Domain.${moduleName}.Users]: Login attempt failed at step ${step} - findUser is required when issueTokens is set to true.`
        );
        throw new ApplicationError('Authentication failed.');
      }
      if (!user) {
        console.info(
          `[Domain.${moduleName}.Users]: Login attempt failed at step ${step} - user is required when issueTokens is set to true.`
        );
        throw new ApplicationError('Authentication failed.');
      }
      // use this type, since it's the most complete one
      const stepResultActual = stepResult as IAMAuthenticationOAuth2CompleteResult;
      let externalAccessToken: string | undefined;
      let externalRefreshToken: string | undefined;
      let refreshToken: string | undefined;
      let useRefreshToken = false;
      if (
        'useReturnedTokens' in stepConfig &&
        stepConfig.useReturnedTokens &&
        stepConfig.authReturnsTokens &&
        'accessToken' in stepResultActual
      ) {
        if (!stepResultActual.accessToken) {
          console.info(
            `[Domain.${moduleName}.Users]: Login attempt failed for ${userFilterField} ${userFilterValue} - no accessToken returned from the authService and useReturnedTokens is set to true.`
          );
          throw new ApplicationError('Authentication failed.');
        }
        externalAccessToken = stepResultActual.accessToken;
        if (stepResultActual.refreshToken) {
          externalRefreshToken = stepResultActual.refreshToken;
          useRefreshToken = true;
        }
      } else {
        useRefreshToken = true;
      }
      // Create local access and refresh tokens, and save them. Their payloads will contain the external tokens, if provided
      const userIdentifierValue = user[defaultUserIdentifierField as keyof User];
      if (useRefreshToken) {
        const {
          result: { token: localRefreshToken }
        } = await this.tokenManager.create(
          {
            externalRefreshToken,
            type: TokenType.Refresh,
            [IAMUsersUserTokenUserIdentifier.FieldName]: userIdentifierValue
          },
          {
            expiresInMinutes:
              (externalRefreshToken &&
                'refreshTokenExpiresIn' in stepResultActual &&
                stepResultActual.refreshTokenExpiresIn) ||
              (rememberUser ? undefined : refreshTokenExpiryTimeInMinutes),
            identifierDataField: IAMUsersUserTokenUserIdentifier.FieldName,
            persist: true,
            purgeOldFromData: true
          }
        );
        refreshToken = localRefreshToken;
      }
      const {
        result: { token: accessToken }
      } = await this.tokenManager.create(
        {
          externalAccessToken,
          refreshToken,
          type: TokenType.Access,
          [IAMUsersUserTokenUserIdentifier.FieldName]: userIdentifierValue
        },
        {
          expiresInMinutes:
            (externalAccessToken &&
              'accessTokenExpiresIn' in stepResultActual &&
              stepResultActual.accessTokenExpiresIn) ||
            accessTokenExpiryTimeInMinutes,
          identifierDataField: IAMUsersUserTokenUserIdentifier.FieldName,
          persist: true,
          purgeOldFromData: true
        }
      );
      console.info(`[Domain.${moduleName}.Users]: Login attempt successful for ${userFilterField} ${userFilterValue}.`);
      return { accessToken, refreshToken, user };
    }
    return { nextStepsRequired: true };
  }

  private async executeStep<AuthData>(
    data: IAMUsersExecuteStepData<AuthData>,
    options: IAMUsersExecuteStepOptions<User>
  ): Promise<IAMUsersExecuteStepResult<User>> {
    const { configProvider, moduleName } = this;
    const { defaultUserIdentifierField } = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const {
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      auth: { type: _authType, ...authData },
      filters: userFilters,
      mainFilterField
    } = data;
    const { authService, stepConfig, name: stepName } = options;
    const { cache: cacheSettings, findUser, findUserBeforeAuth, validWithoutUser } = stepConfig;
    const hasFilters = userFilters && Object.keys(userFilters).length;
    const stepInputData: { data: unknown; options?: unknown } = { data: ld.cloneDeep(authData) };
    let user: IAMUsersUserWithPermissionsData<User, unknown> | null = null;
    let userFilterField: string | undefined;
    let userFilterValue: unknown | undefined;
    // 1. Find the user based on the provided filters, if enabled.
    if (findUser && findUserBeforeAuth) {
      if (!hasFilters) {
        console.info(`[Domain.${moduleName}.Users]: No filters provided for findUserBeforeToken=true.`);
        throw new ApplicationError('Authentication failed.');
      }
      userFilterField = mainFilterField;
      userFilterValue = userFilters[userFilterField];
      user = await this.getUserWithPermissionsData({ filters: userFilters }, { keepPassword: true });
      if (!user) {
        console.info(
          `[Domain.${moduleName}.Users]: Login attempt failed for ${userFilterField} ${userFilterValue} - user not found.`
        );
        throw new ApplicationError('Authentication failed.');
      }
    }
    stepInputData.options = {
      context: user || ({} as IAMUsersUserWithPermissionsData<User, unknown>),
      contextIdentifierField: defaultUserIdentifierField
    };
    // 2. Restore the cache, if configured
    if (cacheSettings && 'use' in cacheSettings && cacheSettings.use) {
      const cacheInput: { data: unknown; options: unknown } = {
        data: stepInputData.data,
        options: stepInputData.options
      };
      const cacheResult = await this.dataUsersAuthCacheService.findOne({
        filters: {
          [cacheSettings.settings.cacheFieldName]: getNested(cacheInput, cacheSettings.settings.inputFieldName)
            .unifiedValue
        }
      });
      if (cacheResult) {
        for (const inputName in cacheSettings.use) {
          const { overwrite, use } = cacheSettings.use[inputName as keyof typeof cacheSettings.use]!;
          if (!use) {
            continue;
          }
          const valueFromCache =
            getNested(cacheResult, inputName, { removeNestedFieldEscapeSign: true }).unifiedValue || {};
          const inputNameKey = inputName as keyof typeof stepInputData;
          if (overwrite) {
            stepInputData[inputNameKey] = ld.merge(stepInputData[inputNameKey], valueFromCache);
            continue;
          }
          stepInputData[inputNameKey] = ld.merge(valueFromCache, stepInputData[inputNameKey]);
        }
      }
    }
    // 3. Run the step method itself.
    const stepResult = await authService[stepName as 'complete' | 'initiate'](
      stepInputData.data as IAMAuthenticationCompleteData,
      stepInputData.options as IAMAuthenticationCompleteOptions<User>
    );
    // 4. Process the step result
    if (!stepResult.valid || (stepResult.mfaUsed && !stepResult.mfaValid)) {
      console.info(`[Domain.${moduleName}.Users]: Bad step result:`, stepResult);
      throw new ApplicationError('Authentication failed.');
    }
    // 5. If thhe step returns tokens and decoding is enabled, decode the reutrned tokens for payloads
    // if (stepConfig.)
    // 6. Find the user based on either the provided filters, or on the stepResult data, if enabled
    if (findUser && !findUserBeforeAuth) {
      if ('findUserInAuthResultBy' in stepConfig && stepConfig.findUserInAuthResultBy) {
        const { userFieldName, resultFieldName } = stepConfig.findUserInAuthResultBy;
        let userFilterValue: unknown | undefined;
        const payloadFilterValue = getNested(stepResult, resultFieldName, {
          removeNestedFieldEscapeSign: true
        }).unifiedValue;
        if (typeof payloadFilterValue !== 'undefined') {
          userFilterValue = payloadFilterValue;
        }
        if (typeof userFilterValue !== 'undefined') {
          user = await this.getUserWithPermissionsData(
            { filters: { [userFieldName]: userFilterValue } },
            { keepPassword: false }
          );
        }
      } else if (hasFilters) {
        userFilterField = mainFilterField;
        userFilterValue = userFilters[userFilterField];
        user = await this.getUserWithPermissionsData({ filters: userFilters }, { keepPassword: false });
      }
    }
    if (validWithoutUser !== true && !user) {
      console.info(
        `[Domain.${moduleName}.Users]: Login attempt failed ${userFilterField && userFilterValue ? `for ${userFilterField} ${userFilterValue} ` : ''}- user not found.`
      );
      throw new ApplicationError('Authentication failed.');
    }
    if (user && 'password' in user) {
      delete user.password;
    }
    // 7. Populate the cache, if configured
    if (cacheSettings && 'populate' in cacheSettings && cacheSettings.populate) {
      const cacheInput: GenericObject = {
        data: stepInputData.data,
        options: stepInputData.options,
        result: stepResult
      };
      const cacheData: GenericObject = {};
      for (const inputName in cacheSettings.populate) {
        const inputSettings = cacheSettings.populate[inputName as keyof typeof cacheSettings.populate];
        if (inputSettings instanceof Array) {
          const innerInputItem: GenericObject = {};
          inputSettings.forEach(fieldName => {
            setNested(
              innerInputItem,
              fieldName.split('.').slice(1).join('.'),
              getNested(cacheInput, fieldName, { removeNestedFieldEscapeSign: true }).unifiedValue
            );
          });
          cacheData[inputName] = innerInputItem;
          continue;
        }
        cacheData[inputName] = cacheInput[inputName];
      }
      await this.dataUsersAuthCacheService.create({
        ...cacheData,
        [cacheSettings.settings.cacheFieldName]: getNested(cacheInput, cacheSettings.settings.inputFieldName)
          .unifiedValue
      });
    }
    return { stepResult, user, userFilterField, userFilterValue };
  }

  async getUserWithPermissionsData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: DataFindOneOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: IAMUsersGetUserWithPermissionsDataOptions
  ): Promise<IAMUsersUserWithPermissionsData<User, unknown> | null> {
    throw new ApplicationError(`Method ${this.moduleName}.IAMUsersService.getUserWithPermissionsData not implemented.`);
  }
}
