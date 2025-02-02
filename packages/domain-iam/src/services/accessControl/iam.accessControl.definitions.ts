import { GenericObject } from '@node-c/core/common/definitions';

export interface AccessControlPoint<Id> {
  allowedInputData?: GenericObject;
  controllerNames?: string[];
  forbiddenInputData?: GenericObject;
  handlerNames?: string[];
  id: Id;
  inputDataFieldName?: string;
  moduleNames?: string[];
  name: string;
  requiredStaticData?: GenericObject;
  userFieldName?: string;
  userTypes: GenericObject[];
}

export interface AccessControlData<AccessControlPointId> {
  __all: {
    __all: { [accessControlPointId: string | number]: AccessControlPoint<AccessControlPointId> };
    [handlerName: string]: { [accessControlPointId: string | number]: AccessControlPoint<AccessControlPointId> };
  };
  [controllerName: string]: {
    __all: { [accessControlPointId: string | number]: AccessControlPoint<AccessControlPointId> };
    [handlerName: string]: { [accessControlPointId: string | number]: AccessControlPoint<AccessControlPointId> };
  };
}

export interface AccessControlUser<AccessControlPointId> {
  currentAccessControlPoints: { [accessControlPointId: string | number]: AccessControlPoint<AccessControlPointId> };
}
