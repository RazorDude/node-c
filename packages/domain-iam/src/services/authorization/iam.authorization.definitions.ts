import { GenericObject } from '@node-c/core';

export enum IAMAuthorizationCheckErrorCode {
  // eslint-disable-next-line no-unused-vars
  FGANoAccess = 'FGA_NO_ACCESS',
  // eslint-disable-next-line no-unused-vars
  RBACNoAccessToModule = 'RBAC_NO_ACCESS_TO_MODULE',
  // eslint-disable-next-line no-unused-vars
  RBACNoAccessToResource = 'RBAC_NO_ACCESS_TO_RESOURCE'
}

export interface IAMAuthorizationStaticCheckAccessOptions {
  moduleName: string;
  resource?: string;
  resourceContext?: string;
}

export interface IAMAuthorizationStaticCheckAccessResult {
  errorCode?: IAMAuthorizationCheckErrorCode;
  hasAccess: boolean;
  inputDataToBeMutated: GenericObject;
  noMatchForResource: boolean;
  permissions: GenericObject<IAMPermission<unknown>>;
}

export interface IAMAuthorizationUser<PermissionId> {
  currentPermissions: GenericObject<IAMPermission<PermissionId>>;
}

export interface IAMAuthorizeApiKeyData {
  apiKey: string;
  signature?: string;
  signatureContent?: string;
}

export interface IAMAuthorizeApiKeyOptions {
  config: { apiKey?: string; apiSecret?: string; apiSecretAlgorithm?: string };
}

export interface IAMPermission<Id> {
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
}
