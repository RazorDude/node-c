import { getNested, setNested } from '@ramster/general-tools';

import immutable from 'immutable';
import { mergeDeepRight as merge } from 'ramda';

import {
  AccessControlData,
  AccessControlUser,
  AccessControlPoint as BaseAccessControlPoint
} from './iam.accessControl.definitions';

import { GenericObject } from '../../../../common/definitions';
import { PersistanceEntityService, SelectOperator } from '../../../../persistance/common/entityService';

export class AccessControlService<AccessControlPoint extends BaseAccessControlPoint<unknown>> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected persistanceAccessControlPointsService: PersistanceEntityService<AccessControlPoint>
  ) {}

  static checkAccess(
    accessPoints: { [id: number]: BaseAccessControlPoint<unknown> },
    inputData: GenericObject,
    user: AccessControlUser<unknown>
  ): {
    hasAccess: boolean;
    inputDataToBeMutated: GenericObject;
  } {
    const userPermissionsData = user.currentAccessControlPoints!;
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
        const values = AccessControlService.matchInputValues(innerMutatedInputData, allowedInputData);
        for (const key in values) {
          innerInputDataToBeMutated[key] = values[key];
          setNested(innerMutatedInputData, key, values[key], { removeNestedFieldEscapeSign: true });
        }
      }
      if (forbiddenInputData && Object.keys(forbiddenInputData).length) {
        const values = AccessControlService.matchInputValues(innerMutatedInputData, forbiddenInputData);
        for (const key in values) {
          innerInputDataToBeMutated[key] = undefined;
          setNested(innerMutatedInputData, key, undefined, { removeNestedFieldEscapeSign: true });
        }
      }
      if (hasStaticData) {
        for (const fieldName in requiredStaticData) {
          if (
            !AccessControlService.testValue(
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
          const valueToTestVariants = AccessControlService.getValuesForTesting(valueToTest);
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

  async mapAccessControlPoints(moduleName: string): Promise<AccessControlData<unknown>> {
    const { items: acpList } = await this.persistanceAccessControlPointsService.find({
      filters: { moduleNames: { [SelectOperator.Contains]: moduleName } },
      findAll: true
    });
    const accessControlData: AccessControlData<unknown> = { __all: { __all: {} } };
    const moduleGlobalData = accessControlData.__all.__all;
    acpList.forEach(item => {
      if (!item.controllerNames) {
        moduleGlobalData[item.id as string] = item;
        return;
      }
      item.controllerNames.forEach(ctlName => {
        let ctlData = accessControlData[ctlName];
        if (!ctlData) {
          ctlData = { __all: {} };
          accessControlData[ctlName] = ctlData;
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
    return accessControlData;
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
        const valueToCheckVariants = AccessControlService.getValuesForTesting(valueToCheck);
        for (const i in valueToCheckVariants) {
          const actualValueToCheck = valueToCheckVariants[i];
          let checkPassed = false;
          for (const j in allowedValues) {
            if (AccessControlService.testValue(actualValueToCheck, allowedValues[j])) {
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
    const possibleValidValues = AccessControlService.getValuesForTesting(valueToTest);
    for (const i in possibleValidValues) {
      if (possibleValidValues[i] === valueToTestAgainst) {
        return true;
      }
    }
    return false;
  }
}
