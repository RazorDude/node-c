import crypto from 'crypto';

import {
  ApplicationError,
  DataEntityService,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainMethod,
  GenericObject,
  LoggerService,
  getNested,
  setNested
} from '@node-c/core';

import ld from 'lodash';

import {
  AuthorizationCheckErrorCode,
  AuthorizationStaticCheckAccessOptions,
  AuthorizationStaticCheckAccessResult,
  AuthorizationUser,
  AuthorizeApiKeyData,
  AuthorizeApiKeyOptions,
  AuthorizationPoint as BaseAuthorizationPoint
} from './iam.authorization.definitions';

import { DecodedTokenContent, IAMTokenManagerService } from '../tokenManager';

export class IAMAuthorizationService<
  AuthorizationPoint extends BaseAuthorizationPoint<unknown> = BaseAuthorizationPoint<unknown>,
  Data extends DomainEntityServiceDefaultData<Partial<AuthorizationPoint>> = DomainEntityServiceDefaultData<
    Partial<AuthorizationPoint>
  >,
  TokenManager extends IAMTokenManagerService<object> = IAMTokenManagerService<object>
> extends DomainEntityService<
  AuthorizationPoint,
  DataEntityService<AuthorizationPoint>,
  Data,
  Record<string, DataEntityService<Partial<AuthorizationPoint>>> | undefined
> {
  constructor(
    protected dataAuthorizationPointsService: DataEntityService<AuthorizationPoint>,
    protected defaultMethods: string[] = [DomainMethod.Find],
    protected logger: LoggerService,
    protected additionalDataEntityServices?: GenericObject<DataEntityService<Partial<AuthorizationPoint>>>,
    // eslint-disable-next-line no-unused-vars
    protected tokenManager?: TokenManager
  ) {
    super(dataAuthorizationPointsService, defaultMethods, logger, additionalDataEntityServices);
  }

  async authorizeApiKey(data: AuthorizeApiKeyData, options: AuthorizeApiKeyOptions): Promise<{ valid: boolean }> {
    const { logger } = this;
    const { apiKey, signature, signatureContent } = data;
    const {
      config: { apiKey: expectedApiKey, apiSecret, apiSecretAlgorithm }
    } = options;
    if (!apiKey) {
      logger.error('Missing api key.');
      return { valid: false };
    }
    if (apiKey !== expectedApiKey) {
      logger.error('Invalid api key.');
      return { valid: false };
    }
    if (apiSecret && apiSecretAlgorithm) {
      if (!signature) {
        logger.error('Missing authorization signature.');
        return { valid: false };
      }
      if (!signatureContent) {
        logger.error('Missing authorization signature content.');
        return { valid: false };
      }
      const calcualtedSignature = crypto
        .createHmac(apiSecretAlgorithm, apiSecret)
        .update(signatureContent)
        .digest('hex');
      if (calcualtedSignature !== signature) {
        logger.error(`Invalid signature provided. Expected: ${calcualtedSignature}. Provided: ${signature}`);
        return { valid: false };
      }
    }
    return { valid: true };
  }

  // TODO: decouple from users
  async authorizeBearer<UserTokenEnityFields = unknown>(
    data: { authToken?: string; refreshToken?: string },
    options?: { identifierDataField?: string }
  ): Promise<{ newAuthToken?: string; tokenContent?: DecodedTokenContent<UserTokenEnityFields>; valid: boolean }> {
    const { logger, tokenManager } = this;
    const { authToken, refreshToken } = data;
    const { identifierDataField } = options || {};
    if (!tokenManager) {
      logger.error('Token manager not configured.');
      return { valid: false };
    }
    if (!authToken) {
      logger.error('Missing auth token.');
      return { valid: false };
    }
    let newAuthToken: string | undefined;
    let tokenContent: DecodedTokenContent<UserTokenEnityFields> | undefined;
    try {
      const tokenRes = await tokenManager.verifyAccessToken(authToken, {
        deleteFromStoreIfExpired: true,
        identifierDataField,
        persistNewToken: true,
        purgeStoreOnRenew: true,
        refreshToken,
        refreshTokenAccessTokenIdentifierDataField: 'accessToken'
      });
      tokenContent = tokenRes.content as unknown as DecodedTokenContent<UserTokenEnityFields>;
      if (tokenRes.newToken) {
        newAuthToken = tokenRes.newToken;
      }
    } catch (e) {
      logger.error('Failed to parse the access or refresh token:', e);
      return { valid: false };
    }
    return { newAuthToken, tokenContent, valid: true };
  }

  async checkAccessWithStorage(): Promise<void> {
    throw new ApplicationError('[IAMAuthorizationService.checkAccessWithStorage]: Method not implemented.');
  }

  static checkAccess<InputData = GenericObject>(
    inputData: InputData,
    user: AuthorizationUser<unknown>,
    options: AuthorizationStaticCheckAccessOptions
  ): AuthorizationStaticCheckAccessResult {
    const { moduleName, resourceContext, resource } = options;
    let hasResource = false;
    if (resource) {
      if (!resourceContext) {
        throw new ApplicationError(
          '[IAMAuthorizationService.checkAccess]: A resourceContext is required when providing a resource value.'
        );
      }
      hasResource = true;
    }
    // check the access to the found authorization points
    const mutatedInputData = ld.cloneDeep(inputData);
    const usedAuthorizationPoints: GenericObject<BaseAuthorizationPoint<unknown>> = {};
    const { currentAuthorizationPoints } = user;
    let authorizationPointsCount = 0;
    let authorizationPointsForDifferentModules = 0;
    let authorizationPointsForDifferentContexts = 0;
    let hasAccess = false;
    let inputDataToBeMutated: GenericObject = {};
    let noMatchForResource = false;
    for (const apId in currentAuthorizationPoints) {
      const apData = currentAuthorizationPoints[apId];
      authorizationPointsCount++;
      // RBAC - check whether the user has general access to the module.
      if (moduleName !== apData.moduleName) {
        authorizationPointsForDifferentModules++;
        continue;
      }
      // RBAC - check whether the user has general access to the resource.
      if (
        hasResource &&
        (!apData.resourceContext ||
          apData.resourceContext !== resourceContext ||
          !apData.resources?.includes(resource!))
      ) {
        authorizationPointsForDifferentContexts++;
        continue;
      }
      // FGA - check whether the user has access based on specific input and user fields.
      const { allowedInputData, forbiddenInputData, inputDataFieldName, requiredStaticData, userFieldName } = apData;
      const hasStaticData = requiredStaticData && Object.keys(requiredStaticData).length;
      const innerMutatedInputData = ld.cloneDeep(mutatedInputData) as GenericObject;
      const innerInputDataToBeMutated: GenericObject = {};
      hasAccess = true;
      if (!noMatchForResource) {
        noMatchForResource = true;
      }
      // 1. Required static data
      if (hasStaticData) {
        for (const fieldName in requiredStaticData) {
          if (
            !IAMAuthorizationService.testValue(
              getNested({ inputData: innerMutatedInputData, user }, fieldName, { removeNestedFieldEscapeSign: true })
                .unifiedValue,
              requiredStaticData[fieldName]
            )
          ) {
            hasAccess = false;
            break;
          }
        }
        if (!hasAccess) {
          continue;
        }
      }
      // 2. User field data vs input field data.
      if (userFieldName && inputDataFieldName) {
        const { paths: inputFieldPaths, unifiedValue: inputFieldValue } = getNested(
          innerMutatedInputData,
          inputDataFieldName,
          {
            removeNestedFieldEscapeSign: true
          }
        );
        const { unifiedValue: userFieldValue } = getNested(user, userFieldName, { removeNestedFieldEscapeSign: true });
        if (typeof userFieldValue === 'undefined') {
          hasAccess = false;
          continue;
        }
        if (typeof inputFieldValue === 'undefined') {
          innerInputDataToBeMutated[inputDataFieldName] = userFieldValue;
          setNested(innerMutatedInputData, inputDataFieldName, userFieldValue, {
            removeNestedFieldEscapeSign: true,
            setNestedArraysPerIndex: inputFieldPaths.length > 1
          });
        } else {
          const allowedValues = IAMAuthorizationService.matchInputValues(innerMutatedInputData, {
            [inputDataFieldName]: userFieldValue
          })[inputDataFieldName] as unknown[];
          const inputValueIsArray = inputFieldValue instanceof Array;
          if (!allowedValues?.length) {
            hasAccess = false;
            continue;
          }
          if (inputValueIsArray) {
            innerInputDataToBeMutated[inputDataFieldName] = allowedValues;
            setNested(innerMutatedInputData, inputDataFieldName, allowedValues, { removeNestedFieldEscapeSign: true });
          }
        }
      }
      // 3. Input data whitelist
      // WARNING: In an expressjs v5+ environment, this will only work properly if the query is mutable
      if (allowedInputData && Object.keys(allowedInputData).length) {
        const values = IAMAuthorizationService.matchInputValues(innerMutatedInputData, allowedInputData);
        for (const key in values) {
          innerInputDataToBeMutated[key] = values[key];
          setNested(innerMutatedInputData, key, values[key], { removeNestedFieldEscapeSign: true });
        }
      }
      // 4. Input data blacklist
      if (forbiddenInputData && Object.keys(forbiddenInputData).length) {
        const values = IAMAuthorizationService.matchInputValues(innerMutatedInputData, forbiddenInputData);
        for (const key in values) {
          innerInputDataToBeMutated[key] = undefined;
          setNested(innerMutatedInputData, key, undefined, { removeNestedFieldEscapeSign: true });
        }
      }
      inputDataToBeMutated = ld.merge(inputDataToBeMutated, innerInputDataToBeMutated);
      usedAuthorizationPoints[apId] = apData;
      break;
    }
    const returnData: AuthorizationStaticCheckAccessResult = {
      authorizationPoints: usedAuthorizationPoints,
      hasAccess,
      inputDataToBeMutated,
      noMatchForResource
    };
    if (!hasAccess) {
      if (authorizationPointsForDifferentModules === authorizationPointsCount) {
        returnData.errorCode = AuthorizationCheckErrorCode.RBACNoAccessToModule;
      } else if (authorizationPointsForDifferentContexts === authorizationPointsCount) {
        returnData.errorCode = AuthorizationCheckErrorCode.RBACNoAccessToResource;
      } else {
        returnData.errorCode = AuthorizationCheckErrorCode.FGANoAccessToModule;
      }
    }
    return returnData;
  }

  static getValuesForTesting(valueToTest: unknown): unknown[] {
    const values = [
      valueToTest, // the value as-is
      parseInt(valueToTest as string, 10), // the int equivalent of the value
      parseFloat(valueToTest as string) // the float equivalent of the value
    ];
    // the boolean equivalent of the values
    if (valueToTest === 'true') {
      values.push(true);
    } else if (valueToTest === 'false') {
      values.push(false);
    }
    return values;
  }

  static matchInputValues(input: GenericObject, values: GenericObject): GenericObject {
    const matchedValues: GenericObject = {};
    for (const fieldName in values) {
      const { paths: valuePaths, values: foundValues } = getNested(input, fieldName, {
        removeNestedFieldEscapeSign: true
      });
      const allowedValue = values[fieldName];
      const allowedValues = allowedValue instanceof Array ? allowedValue : [allowedValue];
      const valuesToSet: unknown[] = [];
      valuePaths.forEach((valuePath, valuePathIndex) => {
        const valueAtIndex = foundValues[valuePathIndex];
        let valueIsArray = false;
        let valuesToCheck: unknown[] = [];
        if (valueAtIndex instanceof Array) {
          valuesToCheck = valueAtIndex;
          valueIsArray = true;
        } else {
          valuesToCheck.push(valueAtIndex);
        }
        valuesToCheck.forEach(valueToCheck => {
          for (const j in allowedValues) {
            if (IAMAuthorizationService.testValue(valueToCheck, allowedValues[j])) {
              valuesToSet.push(valueToCheck);
              break;
            }
          }
        });
        if (!valuesToSet.length) {
          matchedValues[valuePath] = undefined;
          return;
        }
        matchedValues[valuePath] = valueIsArray ? valuesToSet : valuesToSet[0];
      });
    }
    return matchedValues;
  }

  static processOutputData(
    authorizationPoints: { [id: number]: BaseAuthorizationPoint<unknown> },
    outputData: GenericObject
  ): {
    outputDataToBeMutated: GenericObject;
  } {
    const mutatedOutputData = ld.cloneDeep(outputData);
    let outputDataToBeMutated: GenericObject = {};
    for (const apId in authorizationPoints) {
      const apData = authorizationPoints[apId];
      const { allowedOutputData, forbiddenOutputData } = apData;
      const innerMutatedOutputData = ld.cloneDeep(mutatedOutputData);
      const innerOutputDataToBeMutated: GenericObject = {};
      if (allowedOutputData && Object.keys(allowedOutputData).length) {
        const values = IAMAuthorizationService.matchInputValues(innerMutatedOutputData, allowedOutputData);
        for (const key in values) {
          innerOutputDataToBeMutated[key] = values[key];
          setNested(innerMutatedOutputData, key, values[key], { removeNestedFieldEscapeSign: true });
        }
      }
      if (forbiddenOutputData && Object.keys(forbiddenOutputData).length) {
        const values = IAMAuthorizationService.matchInputValues(innerMutatedOutputData, forbiddenOutputData);
        for (const key in values) {
          innerOutputDataToBeMutated[key] = undefined;
          setNested(innerMutatedOutputData, key, undefined, { removeNestedFieldEscapeSign: true });
        }
      }
      outputDataToBeMutated = ld.merge(outputDataToBeMutated, innerOutputDataToBeMutated);
    }
    return { outputDataToBeMutated };
  }

  static testValue(valueToTest: unknown, valueToTestAgainst: unknown): boolean {
    if (
      typeof valueToTestAgainst === 'string' &&
      valueToTestAgainst.charAt(0) === '/' &&
      valueToTestAgainst.charAt(valueToTestAgainst.length - 1) === '/'
    ) {
      const regex = new RegExp(valueToTestAgainst.substring(1, valueToTestAgainst.length - 1));
      if (typeof valueToTest === 'undefined') {
        return false;
      }
      return regex.test(typeof valueToTest === 'string' ? valueToTest : JSON.stringify(valueToTest));
    }
    if (
      typeof valueToTest === 'object' &&
      valueToTest !== null &&
      typeof valueToTestAgainst === 'object' &&
      valueToTestAgainst !== null
    ) {
      return JSON.stringify(valueToTest) === JSON.stringify(valueToTestAgainst);
    }
    const possibleValidValues = IAMAuthorizationService.getValuesForTesting(valueToTest);
    let hasMatch = false;
    for (const i in possibleValidValues) {
      if (possibleValidValues[i] === valueToTestAgainst) {
        hasMatch = true;
        break;
      }
    }
    return hasMatch;
  }
}
