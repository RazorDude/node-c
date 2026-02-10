import {
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainFindOptions,
  DomainMethod,
  GenericObject,
  PersistanceEntityService,
  getNested,
  setNested
} from '@node-c/core';

import ld from 'lodash';

import {
  AuthorizationData,
  AuthorizationUser,
  AuthorizationPoint as BaseAuthorizationPoint
} from './iam.authorization.definitions';

export class IAMAuthorizationService<
  AuthorizationPoint extends BaseAuthorizationPoint<unknown>,
  Data extends DomainEntityServiceDefaultData<Partial<AuthorizationPoint>> = DomainEntityServiceDefaultData<
    Partial<AuthorizationPoint>
  >
> extends DomainEntityService<
  AuthorizationPoint,
  PersistanceEntityService<AuthorizationPoint>,
  Data,
  Record<string, PersistanceEntityService<Partial<AuthorizationPoint>>> | undefined
> {
  constructor(
    protected persistanceAuthorizationPointsService: PersistanceEntityService<AuthorizationPoint>,
    protected defaultMethods: string[] = [DomainMethod.Find],
    protected additionalPersistanceEntityServices?: Record<
      string,
      PersistanceEntityService<Partial<AuthorizationPoint>>
    >
  ) {
    super(persistanceAuthorizationPointsService, defaultMethods, additionalPersistanceEntityServices);
  }

  // TODO: implement this
  async authorizeApiKey(): Promise<boolean> {
    return true;
  }

  // TODO: implement this
  // TODO: validate an OAuth2.0 access token
  async authorizeBearer(): Promise<boolean> {
    return true;
  }

  static checkAccess(
    authorizationPoints: { [id: number]: BaseAuthorizationPoint<unknown> },
    inputData: GenericObject,
    user: AuthorizationUser<unknown>
  ): {
    authorizationPoints: { [id: number]: BaseAuthorizationPoint<unknown> };
    hasAccess: boolean;
    inputDataToBeMutated: GenericObject;
  } {
    const mutatedInputData = ld.cloneDeep(inputData);
    const usedAuthorizationPoints: { [id: number]: BaseAuthorizationPoint<unknown> } = {};
    const userPermissionsData = user.currentAuthorizationPoints!;
    let hasAccess = false;
    let inputDataToBeMutated: GenericObject = {};
    for (const apId in authorizationPoints) {
      if (!userPermissionsData[apId]) {
        continue;
      }
      const apData = authorizationPoints[apId];
      const { allowedInputData, forbiddenInputData, inputDataFieldName, requiredStaticData, userFieldName } = apData;
      const hasStaticData = requiredStaticData && Object.keys(requiredStaticData).length;
      const innerMutatedInputData = ld.cloneDeep(mutatedInputData);
      const innerInputDataToBeMutated: GenericObject = {};
      hasAccess = true;
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
          // TODO: implement setNestedArraysPerIndex
          setNested(innerMutatedInputData, inputDataFieldName, userFieldValue, {
            removeNestedFieldEscapeSign: true,
            setNestedArraysPerIndex: inputFieldPaths.length > 1
          });
        } else {
          const allowedValues = IAMAuthorizationService.matchInputValues(innerMutatedInputData, {
            [inputDataFieldName]: userFieldValue
          })[inputDataFieldName] as unknown[];
          const inputValueIsArray = inputFieldValue instanceof Array;
          if (!allowedValues.length) {
            hasAccess = false;
            continue;
          }
          if (inputValueIsArray) {
            innerInputDataToBeMutated[inputDataFieldName] = allowedValues;
            setNested(innerMutatedInputData, inputDataFieldName, allowedValues, { removeNestedFieldEscapeSign: true });
          }
        }
      }
      if (allowedInputData && Object.keys(allowedInputData).length) {
        const values = IAMAuthorizationService.matchInputValues(innerMutatedInputData, allowedInputData);
        for (const key in values) {
          innerInputDataToBeMutated[key] = values[key];
          setNested(innerMutatedInputData, key, values[key], { removeNestedFieldEscapeSign: true });
        }
      }
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
    return { authorizationPoints: usedAuthorizationPoints, hasAccess, inputDataToBeMutated };
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

  async mapAuthorizationPoints(
    moduleName: string,
    findOptions?: DomainFindOptions
  ): Promise<AuthorizationData<unknown>> {
    // Get all APs in order to avoid the situation where some of the TTLs have expired,
    // so we only get partial cache results, which leads to us not loading the rest from the DB
    const {
      result: { items: apList }
    } = await this.find({
      ...(findOptions || {}),
      findAll: true
    });
    const authorizationData: AuthorizationData<unknown> = { __all: { __all: {} } };
    const moduleGlobalData = authorizationData.__all.__all;
    apList.forEach(item => {
      if (item.moduleNames && !item.moduleNames?.includes(moduleName)) {
        return;
      }
      if (!item.controllerNames) {
        moduleGlobalData[item.id as string] = item;
        return;
      }
      item.controllerNames.forEach(ctlName => {
        let ctlData = authorizationData[ctlName];
        if (!ctlData) {
          ctlData = { __all: {} };
          authorizationData[ctlName] = ctlData;
        }
        if (!item.handlerNames) {
          ctlData.__all[item.id as string] = item;
          return;
        }
        item.handlerNames.forEach(hName => {
          let hData = ctlData[hName];
          if (!hData) {
            hData = {};
            ctlData[hName] = hData;
          }
          hData[item.id as string] = item;
        });
      });
    });
    return authorizationData;
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
