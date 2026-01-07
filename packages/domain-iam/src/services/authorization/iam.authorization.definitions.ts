import { GenericObject } from '@node-c/core';

export interface AuthorizationPoint<Id> {
  allowedInputData?: GenericObject;
  allowedOutputData?: GenericObject;
  controllerNames?: string[];
  forbiddenInputData?: GenericObject;
  forbiddenOutputData?: GenericObject;
  handlerNames?: string[];
  id: Id;
  inputDataFieldName?: string;
  moduleNames?: string[];
  name: string;
  requiredStaticData?: GenericObject;
  userFieldName?: string;
  userTypes: GenericObject[];
}

export interface AuthorizationData<AuthorizationPointId> {
  __all: {
    __all: { [authorizationPointId: string | number]: AuthorizationPoint<AuthorizationPointId> };
    [handlerName: string]: { [authorizationPointId: string | number]: AuthorizationPoint<AuthorizationPointId> };
  };
  [controllerName: string]: {
    __all: { [authorizationPointId: string | number]: AuthorizationPoint<AuthorizationPointId> };
    [handlerName: string]: { [authorizationPointId: string | number]: AuthorizationPoint<AuthorizationPointId> };
  };
}

export interface AuthorizationUser<AuthorizationPointId> {
  currentAuthorizationPoints: { [authorizationPointId: string | number]: AuthorizationPoint<AuthorizationPointId> };
}
