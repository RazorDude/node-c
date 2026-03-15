import {
  AppConfigDomainIAM,
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService,
  DataDefaultData,
  DataEntityService,
  DataFindOneOptions,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  GenericObject,
  LoggerService,
  getNested,
  setNested
} from '@node-c/core';

import ld from 'lodash';

import {
  IAMUserManagerCreateAccessTokenOptions,
  IAMUserManagerCreateAccessTokenReturnData,
  IAMUserManagerExecuteStepData,
  IAMUserManagerExecuteStepOptions,
  IAMUserManagerExecuteStepResult,
  IAMUserManagerGetUserWithPermissionsDataOptions,
  IAMUserManagerUserTokenEnityFields,
  IAMUserManagerUserTokenUserIdentifier,
  IAMUserManagerUserWithPermissionsData
} from './iam.userManager.definitions';

import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationGetUserDataFromExternalTokenPayloadsData,
  IAMAuthenticationService,
  IAMAuthenticationType
} from '../authentication';
import { IAMAuthenticationOAuth2CompleteResult, IAMAuthenticationOAuth2Service } from '../authenticationOAuth2';
import {
  IAMAuthenticationUserLocalCompleteResult,
  IAMAuthenticationUserLocalService
} from '../authenticationUserLocal';
import { IAMTokenManagerService, TokenType } from '../tokenManager';

// TODO: create user (signup); this should include password hashing
// TODO: update password (incl. hashing)
// TODO: reset password
// TODO: periodic checking of external access tokens and their revoking
export class IAMUserManagerService<
  User extends object,
  Data extends DomainEntityServiceDefaultData<Partial<User>> = DomainEntityServiceDefaultData<Partial<User>>,
  DataEntityServiceData extends DataDefaultData<Partial<User>> = DataDefaultData<Partial<User>>
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected authServices: {
      [IAMAuthenticationType.OAuth2]?: IAMAuthenticationOAuth2Service<object, object>;
      [IAMAuthenticationType.UserLocal]?: IAMAuthenticationUserLocalService<object, object>;
    } & { [serviceName: string]: IAMAuthenticationService<object, object> },
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected dataUsersAuthCacheService: DataEntityService<GenericObject>,
    // eslint-disable-next-line no-unused-vars
    protected domainUsersEntityService: DomainEntityService<
      User,
      DataEntityService<User, DataEntityServiceData>,
      Data,
      Record<string, DataEntityService<Partial<User>, DataDefaultData<object>>> | undefined
    >,
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected tokenManager: IAMTokenManagerService<IAMUserManagerUserTokenEnityFields>
  ) {}

  // TODO: clear the cache from the previous steps
  // TODO: make the issuing of local tokens work with purgeOldFromStore = false
  async createAccessToken<AuthData = unknown>(
    options: IAMUserManagerCreateAccessTokenOptions<AuthData>
  ): Promise<IAMUserManagerCreateAccessTokenReturnData<User>> {
    const { configProvider, logger, moduleName } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { accessTokenExpiryTimeInMinutes, defaultUserIdentifierField, refreshTokenExpiryTimeInMinutes } =
      moduleConfig;
    const {
      auth: { type: authType },
      rememberUser
    } = options;
    logger.info(
      `[Domain.${moduleName}.UserManager]: Login attempt started${options.step ? ` for step ${options.step}` : ''}.`
    );
    // 1. Make sure the auth service actually exists - local, oauth2, etc.
    const authService = this.authServices[authType] as IAMAuthenticationService<object, object>;
    if (!authService) {
      logger.info(`[Domain.${moduleName}.UserManager]: No authService ${authType} found.`);
      throw new ApplicationError('Authentication failed.');
    }
    // 2. Get the user-specific configuration from the authService.
    const authServiceBehaviorConfig = authService.getUserCreateAccessTokenConfig();
    let externalAccessToken: string | undefined;
    let externalRefreshToken: string | undefined;
    let issueTokens = false;
    let step: AppConfigDomainIAMAuthenticationStep;
    let userFilterField: string | undefined;
    let userFilterValue: unknown | undefined;
    // 3. Prepare the step behavior based on the configuration.
    // 3.1. Complete step
    if (options.step === AppConfigDomainIAMAuthenticationStep.Complete) {
      issueTokens = true;
      step = AppConfigDomainIAMAuthenticationStep.Complete;
    }
    // 3.2. Initiate step - assumed implicitly.
    else {
      step = AppConfigDomainIAMAuthenticationStep.Initiate;
    }
    let stepConfig = authServiceBehaviorConfig[step];
    // 3. Run the authentication method itself.
    // eslint-disable-next-line prefer-const
    let { stepResult, user, ...otherStepData } = await this.executeStep(options, {
      authService,
      name: step,
      stepConfig
    });
    // 4. Run the final step, if this is the first step no mfa has been used.
    if (step === AppConfigDomainIAMAuthenticationStep.Initiate && !stepResult.mfaUsed) {
      issueTokens = true;
      step = AppConfigDomainIAMAuthenticationStep.Complete;
      stepConfig = authServiceBehaviorConfig[step];
      const finalStepData = await this.executeStep(options, {
        authService,
        name: step,
        stepConfig: ld.omit(stepConfig, 'cache')
      });
      stepResult = finalStepData.stepResult;
      user = user ?? finalStepData.user;
      userFilterField = finalStepData.userFilterField;
      userFilterValue = finalStepData.userFilterValue;
    }
    // 5. Process the external access, refresh and, optionally, id tokens that are returned by the step execution.
    const actualStepResult = stepResult as
      | IAMAuthenticationOAuth2CompleteResult
      | IAMAuthenticationUserLocalCompleteResult;
    if (!userFilterField && otherStepData.userFilterField) {
      userFilterField = otherStepData.userFilterField;
    }
    if (!userFilterValue && otherStepData.userFilterValue) {
      userFilterValue = otherStepData.userFilterValue;
    }
    if ('useReturnedTokens' in stepConfig && stepConfig.useReturnedTokens && stepConfig.authReturnsTokens) {
      // Make sure we have an accessToken in the response and set the access and refresh tokens in variables for later use.
      if (!actualStepResult.accessToken) {
        logger.info(
          `[Domain.${moduleName}.UserManager]: Login attempt failed for ${userFilterField} ${userFilterValue} - no accessToken returned from the authService and useReturnedTokens is set to true.`
        );
        throw new ApplicationError('Authentication failed.');
      }
      externalAccessToken = actualStepResult.accessToken;
      if (actualStepResult.refreshToken) {
        externalRefreshToken = actualStepResult.refreshToken;
      }
    }
    // 6. Token management. In this case, we will definitely have the user, or will be force to create it.
    if (issueTokens) {
      if (!user) {
        logger.info(
          `[Domain.${moduleName}.UserManager]: Login attempt failed at step ${step} - user is required when issueTokens is set to true.`
        );
        throw new ApplicationError('Authentication failed.');
      }
      let refreshToken: string | undefined;
      // 6.1. Create a local refresh token and save it. The payload contains the external refresh token, if it exists.
      const userIdentifierValue = user[defaultUserIdentifierField as keyof User];
      if (externalRefreshToken || !externalAccessToken) {
        const {
          result: { token: localRefreshToken }
        } = await this.tokenManager.create(
          {
            type: TokenType.Refresh,
            [IAMUserManagerUserTokenUserIdentifier.FieldName]: userIdentifierValue,
            ...(externalRefreshToken
              ? {
                  externalToken: externalRefreshToken,
                  externalTokenAuthService: authType as IAMAuthenticationType
                }
              : {})
          },
          {
            expiresInMinutes:
              (externalRefreshToken &&
                'refreshTokenExpiresIn' in actualStepResult &&
                actualStepResult.refreshTokenExpiresIn) ||
              (rememberUser ? undefined : refreshTokenExpiryTimeInMinutes),
            identifierDataField: IAMUserManagerUserTokenUserIdentifier.FieldName,
            persist: true,
            purgeOldFromData: true,
            tokenContentOnlyFields: ['externalToken']
          }
        );
        refreshToken = localRefreshToken;
      }
      // 6.2. Create a local access token and save it. The payload contains the external access token, if it exists.
      const {
        result: { token: accessToken }
      } = await this.tokenManager.create(
        {
          refreshToken,
          type: TokenType.Access,
          user,
          [IAMUserManagerUserTokenUserIdentifier.FieldName]: userIdentifierValue,
          ...(externalAccessToken
            ? {
                externalToken: externalAccessToken,
                externalTokenAuthService: authType as IAMAuthenticationType
              }
            : {})
        },
        {
          expiresInMinutes:
            (externalAccessToken &&
              'accessTokenExpiresIn' in actualStepResult &&
              actualStepResult.accessTokenExpiresIn) ||
            accessTokenExpiryTimeInMinutes,
          identifierDataField: IAMUserManagerUserTokenUserIdentifier.FieldName,
          persist: true,
          purgeOldFromData: true,
          tokenContentOnlyFields: ['externalToken', 'refreshToken', 'user']
        }
      );
      logger.info(
        `[Domain.${moduleName}.UserManager]: Login attempt successful for ${userFilterField} ${userFilterValue}.`
      );
      return { accessToken, refreshToken, user };
    }
    const returnData: IAMUserManagerCreateAccessTokenReturnData<User> = { nextStepsRequired: true };
    if (stepConfig.stepResultPublicFields?.length) {
      stepConfig.stepResultPublicFields.forEach(fieldName => {
        setNested(
          returnData,
          fieldName,
          getNested(stepResult, fieldName, { removeNestedFieldEscapeSign: true }).unifiedValue
        );
      });
    }
    return returnData;
  }

  private async executeStep<AuthData>(
    data: IAMUserManagerExecuteStepData<AuthData>,
    options: IAMUserManagerExecuteStepOptions<User>
  ): Promise<IAMUserManagerExecuteStepResult<User>> {
    const { configProvider, domainUsersEntityService, logger, moduleName } = this;
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
    let user: IAMUserManagerUserWithPermissionsData<User, unknown> | null = null;
    let userFilterField: string | undefined;
    let userFilterValue: unknown | undefined;
    // 1. Find the user based on the provided filters, if enabled.
    if (findUser && findUserBeforeAuth) {
      if (!hasFilters) {
        logger.info(`[Domain.${moduleName}.UserManager]: No filters provided for findUserBeforeToken=true.`);
        throw new ApplicationError('Authentication failed.');
      }
      userFilterField = mainFilterField;
      userFilterValue = userFilters[userFilterField];
      user = await this.getUserForStepExecution({ filters: userFilters, mainFilterField: userFilterField });
      if (!user) {
        logger.info(
          `[Domain.${moduleName}.UserManager]: Login attempt failed for ${userFilterField} ${userFilterValue} - user not found.`
        );
        throw new ApplicationError('Authentication failed.');
      }
    }
    stepInputData.options = {
      context: user || ({} as IAMUserManagerUserWithPermissionsData<User, unknown>),
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
    let stepResult = await authService[stepName as 'complete' | 'initiate'](
      stepInputData.data as IAMAuthenticationCompleteData,
      stepInputData.options as IAMAuthenticationCompleteOptions<User>
    );
    // 4. Process the step result
    if (!stepResult.valid || (stepResult.mfaUsed && !stepResult.mfaValid)) {
      logger.info(`[Domain.${moduleName}.UserManager]: Bad step result:`, stepResult);
      throw new ApplicationError('Authentication failed.');
    }
    // 5. If the step returns tokens and decoding is enabled, decode the reutrned tokens for payloads
    if ('decodeReturnedTokens' in stepConfig && stepConfig.decodeReturnedTokens) {
      const tokensForDecoding: Record<string, string> = {};
      const tokenKeys = ['accessToken', 'idToken', 'refreshToken'];
      tokenKeys.forEach(tokenKey => {
        const resultForKey = stepResult[tokenKey as keyof typeof stepResult] as unknown as string;
        if (!resultForKey) {
          return;
        }
        tokensForDecoding[tokenKey] = resultForKey;
      });
      const externalTokenPayloads = await authService.getPayloadsFromExternalTokens(tokensForDecoding);
      stepResult = { ...stepResult, ...externalTokenPayloads };
    }
    // 6. Find the user based on either the provided filters, or on the stepResult data, if enabled
    if (findUser && !findUserBeforeAuth) {
      if ('findUserInAuthResultBy' in stepConfig && stepConfig.findUserInAuthResultBy) {
        const { userFieldName, resultFieldName } = stepConfig.findUserInAuthResultBy;
        const payloadFilterValue = getNested(stepResult, resultFieldName, {
          removeNestedFieldEscapeSign: true
        }).unifiedValue;
        userFilterField = userFieldName;
        if (typeof payloadFilterValue !== 'undefined') {
          userFilterValue = payloadFilterValue;
        }
        if (typeof userFilterValue !== 'undefined') {
          user = await this.getUserForStepExecution({
            filters: { [userFieldName]: userFilterValue },
            mainFilterField: userFieldName
          });
        }
      } else if (hasFilters) {
        userFilterField = mainFilterField;
        userFilterValue = userFilters[userFilterField];
        user = await this.getUserForStepExecution({
          filters: userFilters,
          mainFilterField: userFilterField
        });
      }
    }
    // 7. Create a user using the data from the tokens returned by the step execution, if enabled and there is no user found.
    if (!user && 'createUser' in stepConfig && stepConfig.createUser) {
      const userData = await authService.getUserDataFromExternalTokenPayloads(
        stepResult as IAMAuthenticationGetUserDataFromExternalTokenPayloadsData
      );
      if (userData) {
        const { result: createdUser } = await domainUsersEntityService.create(userData as unknown as Data['Create']);
        user = await this.getUserWithPermissionsData(
          {
            filters: {
              [defaultUserIdentifierField]: createdUser[defaultUserIdentifierField as keyof typeof createdUser]
            }
          },
          { keepPassword: false }
        );
      }
    }
    if (validWithoutUser !== true && !user) {
      logger.info(
        `[Domain.${moduleName}.UserManager]: Login attempt failed ${userFilterField && userFilterValue ? `for ${userFilterField} ${userFilterValue} ` : ''}- user not found.`
      );
      throw new ApplicationError('Authentication failed.');
    }
    if (user && 'password' in user) {
      delete user.password;
    }
    // 8. Populate the cache, if configured
    if (stepResult.mfaUsed && cacheSettings && 'populate' in cacheSettings && cacheSettings.populate) {
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
          inputSettings.forEach(inputItemSettings => {
            const { cacheFieldName, inputFieldName } = inputItemSettings;
            setNested(
              innerInputItem,
              cacheFieldName,
              getNested(cacheInput, inputFieldName, { removeNestedFieldEscapeSign: true }).unifiedValue
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

  protected async getUserForStepExecution(options: {
    filters: GenericObject;
    mainFilterField: string;
  }): Promise<IAMUserManagerUserWithPermissionsData<User, unknown> | null> {
    const { configProvider, moduleName } = this;
    const { defaultUserIdentifierField } = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { mainFilterField } = options;
    let filters: GenericObject = options.filters;
    let user: IAMUserManagerUserWithPermissionsData<User, unknown> | null = null;
    if (mainFilterField !== defaultUserIdentifierField) {
      const mainFilterFieldResult = await this.domainUsersEntityService.findOne({ filters });
      if (!mainFilterFieldResult.result) {
        return null;
      }
      filters = {
        [defaultUserIdentifierField]:
          mainFilterFieldResult.result[defaultUserIdentifierField as keyof typeof mainFilterFieldResult.result]
      };
    } else {
      filters = options.filters;
    }
    user = await this.getUserWithPermissionsData({ filters }, { keepPassword: true });
    return user;
  }

  async getUserWithPermissionsData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: DataFindOneOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: IAMUserManagerGetUserWithPermissionsDataOptions
  ): Promise<IAMUserManagerUserWithPermissionsData<User, unknown> | null> {
    throw new ApplicationError(
      `Method ${this.moduleName}.IAMUserManagerService.getUserWithPermissionsData not implemented.`
    );
  }
}
