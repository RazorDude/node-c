import { DomainFindOneOptions, DomainFindOnePrivateOptions } from '@node-c/core';

import { IAMAuthorizationUser } from '../authorization';

export type IAMUsersGetUserWithPermissionsDataOptions = DomainFindOneOptions;

export interface IAMUsersGetUserWithPermissionsDataPrivateOptions extends DomainFindOnePrivateOptions {
  keepPassword?: boolean;
}

export type IAMUserWithPermissionsData<UserData, PermissionId> = IAMAuthorizationUser<PermissionId> & UserData;
