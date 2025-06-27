import {
  DomainBaseOptionsForAdditionalServicesFull,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainMethod,
  GenericObject,
  PersistanceEntityService,
  PersistanceSelectOperator
} from '@node-c/core';

import immutable from 'immutable';
import ld from 'lodash';
import { mergeDeepRight as merge } from 'ramda';

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

  static checkAccess(
    authorizationPoints: { [id: number]: BaseAuthorizationPoint<unknown> },
    inputData: GenericObject,
    user: AuthorizationUser<unknown>
  ): {
    hasAccess: boolean;
    inputDataToBeMutated: GenericObject;
  } {
    const mutatedInputData = immutable.fromJS(inputData).toJS();
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
      const innerMutatedInputData = immutable.fromJS(mutatedInputData).toJS();
      const innerInputDataToBeMutated: GenericObject = {};
      hasAccess = true;
      if (allowedInputData && Object.keys(allowedInputData).length) {
        const values = IAMAuthorizationService.matchInputValues(innerMutatedInputData, allowedInputData);
        for (const key in values) {
          innerInputDataToBeMutated[key] = values[key];
          ld.set(innerMutatedInputData, key, values[key]);
        }
      }
      if (forbiddenInputData && Object.keys(forbiddenInputData).length) {
        const values = IAMAuthorizationService.matchInputValues(innerMutatedInputData, forbiddenInputData);
        for (const key in values) {
          innerInputDataToBeMutated[key] = undefined;
          ld.set(innerMutatedInputData, key, undefined);
        }
      }
      if (hasStaticData) {
        for (const fieldName in requiredStaticData) {
          if (
            !IAMAuthorizationService.testValue(
              ld.get({ inputData: innerMutatedInputData, user }, fieldName),
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
        const inputFieldValue = ld.get(innerMutatedInputData, inputDataFieldName, {
          removeNestedFieldEscapeSign: true
        });
        const userFieldValue = ld.get(user, userFieldName);
        if (typeof userFieldValue === 'undefined' || typeof inputFieldValue === 'undefined') {
          hasAccess = false;
          continue;
        }
        const allowedValues: unknown[] = [];
        const inputValueIsArray = inputFieldValue instanceof Array;
        const valuesToTest = inputValueIsArray ? inputFieldValue : [inputFieldValue];
        const valuesToTestAgainst = userFieldValue instanceof Array ? userFieldValue : [userFieldValue];
        valuesToTest.forEach((valueToTest: unknown) => {
          const valueToTestVariants = IAMAuthorizationService.getValuesForTesting(valueToTest);
          for (const j in valuesToTestAgainst) {
            const valueToTestAgainst = valuesToTestAgainst[j];
            let matchFound = false;
            for (const k in valueToTestVariants) {
              const variant = valueToTestVariants[k];
              if (valueToTestAgainst === variant) {
                allowedValues.push(variant);
                matchFound = true;
                break;
              }
            }
            if (matchFound) {
              break;
            }
          }
        });
        if (!allowedValues.length) {
          hasAccess = false;
          continue;
        }
        if (inputValueIsArray) {
          innerInputDataToBeMutated[inputDataFieldName] = allowedValues;
          ld.set(mutatedInputData, inputDataFieldName, allowedValues);
        }
      }
      inputDataToBeMutated = merge(inputDataToBeMutated, innerInputDataToBeMutated);
      break;
    }
    return { hasAccess, inputDataToBeMutated };
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
    additionalServicesOptions?: DomainBaseOptionsForAdditionalServicesFull
  ): Promise<AuthorizationData<unknown>> {
    const {
      result: { items: apList }
    } = await this.find({
      ...(additionalServicesOptions || {}),
      filters: { moduleNames: { [PersistanceSelectOperator.Contains]: moduleName } },
      findAll: true
    });
    const authorizationData: AuthorizationData<unknown> = { __all: { __all: {} } };
    const moduleGlobalData = authorizationData.__all.__all;
    apList.forEach(item => {
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
    const mutatedInput = immutable.fromJS(input).toJS();
    for (const fieldName in values) {
      const value = ld.get(input, fieldName);
      const allowedValue = values[fieldName];
      const allowedValues = allowedValue instanceof Array ? allowedValue : [allowedValue];
      let valueIsArray = false;
      let valuesToCheck: unknown[] = [];
      const valuesToSet: unknown[] = [];
      if (value instanceof Array) {
        valuesToCheck = value;
        valueIsArray = true;
      } else {
        valuesToCheck.push(value);
      }
      valuesToCheck.forEach(valueToCheck => {
        const valueToCheckVariants = IAMAuthorizationService.getValuesForTesting(valueToCheck);
        for (const i in valueToCheckVariants) {
          const actualValueToCheck = valueToCheckVariants[i];
          let checkPassed = false;
          for (const j in allowedValues) {
            if (IAMAuthorizationService.testValue(actualValueToCheck, allowedValues[j])) {
              valuesToSet.push(valueToCheck);
              checkPassed = true;
              break;
            }
          }
          if (checkPassed) {
            break;
          }
        }
      });
      if (!valuesToSet.length) {
        ld.set(mutatedInput, fieldName, undefined);
        continue;
      }
      ld.set(mutatedInput, fieldName, valueIsArray ? valuesToSet : valuesToSet[0]);
    }
    return mutatedInput;
  }

  static testValue(valueToTest: unknown, valueToTestAgainst: unknown): boolean {
    if (
      typeof valueToTest === 'string' &&
      typeof valueToTestAgainst === 'string' &&
      valueToTestAgainst.charAt(0) === '/' &&
      valueToTestAgainst.charAt(valueToTestAgainst.length - 1) === '/'
    ) {
      const regex = new RegExp(valueToTestAgainst.substring(1, valueToTestAgainst.length - 2));
      return regex.test(valueToTest);
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
