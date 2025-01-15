import { GenericObject } from '../../../../common/definitions';

export interface AccessControlPoint {
  allowedInputData?: GenericObject;
  controllerNames?: string[];
  forbiddenInputData?: GenericObject;
  handlerNames?: string[];
  id: number;
  inputDataFieldName?: string;
  moduleNames?: string[];
  name: string;
  requiredStaticData?: GenericObject;
  userFieldName?: string;
  userTypes: GenericObject[];
}

export interface AccessControlData {
  __all: {
    __all: { [accessControlPointId: number]: AccessControlPoint };
    [handlerName: string]: { [accessControlPointId: number]: AccessControlPoint };
  };
  [controllerName: string]: {
    __all: { [accessControlPointId: number]: AccessControlPoint };
    [handlerName: string]: { [accessControlPointId: number]: AccessControlPoint };
  };
}

export interface AccessControlUser {
  currentAccessControlPoints: { [accessControlPointId: string]: AccessControlPoint };
}
