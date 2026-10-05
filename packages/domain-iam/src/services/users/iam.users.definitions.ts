import type {
  DomainFindOneOptions,
  DomainFindOnePrivateOptions
} from '@node-c/core';

import type { IAMAuthorizationUser } from '../authorization/iam.authorization.definitions.js';

export type IAMUsersGetUserWithPermissionsDataOptions = DomainFindOneOptions;

export interface IAMUsersGetUserWithPermissionsDataPrivateOptions
  extends DomainFindOnePrivateOptions {
  keepPassword?: boolean;
}

export type IAMUserWithPermissionsData<UserData, PermissionId> =
  IAMAuthorizationUser<PermissionId> & UserData;
