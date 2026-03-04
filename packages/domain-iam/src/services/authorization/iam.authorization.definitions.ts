import { GenericObject } from '@node-c/core';

export enum AuthorizationCheckErrorCode {
  // eslint-disable-next-line no-unused-vars
  FGANoAccessToModule = 'FGA_NO_ACCESS',
  // eslint-disable-next-line no-unused-vars
  RBACNoAccessToModule = 'RBAC_NO_ACCESS_TO_MODULE',
  // eslint-disable-next-line no-unused-vars
  RBACNoAccessToResource = 'RBAC_NO_ACCESS_TO_RESOURCE'
}

export interface AuthorizationPoint<Id> {
  allowedInputData?: GenericObject;
  allowedOutputData?: GenericObject;
  forbiddenInputData?: GenericObject;
  forbiddenOutputData?: GenericObject;
  id: Id;
  inputDataFieldName?: string;
  moduleName: string;
  name: string;
  requiredStaticData?: GenericObject;
  resources?: string[];
  // required when resources is set
  resourceContext?: string;
  userFieldName?: string;
  userTypes: GenericObject[];
}

export interface AuthorizationStaticCheckAccessOptions {
  moduleName: string;
  resource?: string;
  resourceContext?: string;
}

export interface AuthorizationStaticCheckAccessResult {
  authorizationPoints: GenericObject<AuthorizationPoint<unknown>>;
  errorCode?: AuthorizationCheckErrorCode;
  hasAccess: boolean;
  inputDataToBeMutated: GenericObject;
  noMatchForResource: boolean;
}

export interface AuthorizationUser<AuthorizationPointId> {
  currentAuthorizationPoints: GenericObject<AuthorizationPoint<AuthorizationPointId>>;
}

export interface AuthorizeApiKeyData {
  apiKey: string;
  signature?: string;
  signatureContent?: string;
}

export interface AuthorizeApiKeyOptions {
  config: { apiKey?: string; apiSecret?: string; apiSecretAlgorithm?: string };
}
