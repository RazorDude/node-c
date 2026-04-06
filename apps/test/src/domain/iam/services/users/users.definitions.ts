import { DomainCreateData, DomainEntityServiceDefaultData, DomainUpdateData } from '@node-c/core';
import {
  IAMUsersGetUserWithPermissionsDataOptions,
  IAMUsersGetUserWithPermissionsDataPrivateOptions
} from '@node-c/domain-iam';

import { DataDBUsersCreateUserData, DataDBUsersUpdateUserData } from '../../../../data/db';

export type DomainIAMUsersDomainEntityServiceCreateData<User> = DomainCreateData<User> & DataDBUsersCreateUserData;

export type DomainIAMUsersDomainEntityServiceData<User> = DomainEntityServiceDefaultData<User> & {
  Create: DomainIAMUsersDomainEntityServiceCreateData<User>;
  Update: DomainIAMUsersDomainEntityServiceUpdateData<User>;
};

export type DomainIAMUsersDomainEntityServiceUpdateData<User> = DomainUpdateData<User> & DataDBUsersUpdateUserData;

export type DomainIAMUsersGetUserWithPermissionsDataOptions = IAMUsersGetUserWithPermissionsDataOptions;

export type DomainIAMUsersGetUserWithPermissionsDataPrivateOptions = IAMUsersGetUserWithPermissionsDataPrivateOptions;
