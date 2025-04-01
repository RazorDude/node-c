import {
  DomainBaseOptionsForAdditionalServicesFull,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainMethod,
  GenericObject,
  PersistanceEntityService,
  PersistanceSelectOperator
} from '@node-c/core';

import { getNested, setNested } from '@ramster/general-tools';

import immutable from 'immutable';
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
    accessPoints: { [id: number]: BaseAuthorizationPoint<unknown> },
    inputData: GenericObject,
    user: AuthorizationUser<unknown>
  ): {
    hasAccess: boolean;
    inputDataToBeMutated: GenericObject;
  } {
    const userPermissionsData = user.currentAuthorizationPoints!;
    let hasAccess = false;
    const inputDataToBeMutated: GenericObject = {};
    const mutatedInputData = immutable.fromJS(inputData).toJS();
    for (const acpId in accessPoints) {
      const acpData = userPermissionsData[acpId];
      if (!acpData) {
        continue;
      }
      const { allowedInputData, forbiddenInputData, inputDataFieldName, requiredStaticData, userFieldName } = acpData;
      const hasStaticData = requiredStaticData && Object.keys(requiredStaticData).length;
      const innerMutatedInputData = immutable.fromJS(mutatedInputData).toJS();
      const innerInputDataToBeMutated: GenericObject = {};
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
      if (hasStaticData) {
        for (const fieldName in requiredStaticData) {
          if (
            !IAMAuthorizationService.testValue(
              getNested({ inputData: innerMutatedInputData, user }, fieldName, { removeNestedFieldEscapeSign: true }),
              requiredStaticData[fieldName]
            )
          ) {
            hasAccess = false;
            break;
          }
          if (!hasAccess) {
            hasAccess = true;
          }
        }
        if (hasAccess) {
          hasAccess = false;
        } else {
          continue;
        }
      }
      if (userFieldName) {
        if (!inputDataFieldName) {
          continue;
        }
        const userFieldValue = getNested(user, userFieldName, { removeNestedFieldEscapeSign: true }),
          inputFieldValue = getNested(innerMutatedInputData, inputDataFieldName, { removeNestedFieldEscapeSign: true });
        if (typeof userFieldValue === 'undefined' || typeof inputFieldValue === 'undefined') {
          continue;
        }
        const inputValueIsArray = inputFieldValue instanceof Array,
          valuesToTest = inputValueIsArray ? inputFieldValue : [inputFieldValue],
          valuesToTestAgainst = userFieldValue instanceof Array ? userFieldValue : [userFieldValue];
        const allowedValues: unknown[] = [];
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
          continue;
        }
        if (inputValueIsArray) {
          innerInputDataToBeMutated[inputDataFieldName] = allowedValues;
          setNested(mutatedInputData, inputDataFieldName, allowedValues, { removeNestedFieldEscapeSign: true });
        }
        hasAccess = true;
        merge(innerInputDataToBeMutated, innerInputDataToBeMutated);
        break;
      }
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
      result: { items: acpList }
    } = await this.find({
      ...(additionalServicesOptions || {}),
      filters: { moduleNames: { [PersistanceSelectOperator.Contains]: moduleName } },
      findAll: true
    });
    const authorizationData: AuthorizationData<unknown> = { __all: { __all: {} } };
    const moduleGlobalData = authorizationData.__all.__all;
    acpList.forEach(item => {
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
      const value = getNested(input, fieldName, { removeNestedFieldEscapeSign: true });
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
        setNested(mutatedInput, fieldName, undefined, { removeNestedFieldEscapeSign: true });
        continue;
      }
      setNested(mutatedInput, fieldName, valueIsArray ? valuesToSet : valuesToSet[0], {
        removeNestedFieldEscapeSign: true
      });
    }
    return mutatedInput;
  }

  static testValue(valueToTest: unknown, valueToTestAgainst: unknown): boolean {
    if (
      typeof valueToTest === 'string' &&
      typeof valueToTestAgainst === 'string' &&
      valueToTest.charAt(0) === '/' &&
      valueToTest.charAt(valueToTest.length - 1) === '/'
    ) {
      const regex = new RegExp(valueToTest);
      return regex.test(valueToTestAgainst);
    }
    const possibleValidValues = IAMAuthorizationService.getValuesForTesting(valueToTest);
    for (const i in possibleValidValues) {
      if (possibleValidValues[i] === valueToTestAgainst) {
        return true;
      }
    }
    return false;
  }
}
