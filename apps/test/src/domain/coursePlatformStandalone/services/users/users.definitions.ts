import { DomainCreateData, DomainEntityServiceDefaultData, DomainUpdateData } from '@node-c/core';
import {
  IAMUsersGetUserWithPermissionsDataOptions,
  IAMUsersGetUserWithPermissionsDataPrivateOptions
} from '@node-c/domain-iam';

import { DataDBUsersCreateUserData, DataDBUsersUpdateUserData } from '../../../../data/db';

export type DomainCoursePlatformStandaloneUsersServiceCreateData<User> = DomainCreateData<User> &
  DataDBUsersCreateUserData;

export type DomainCoursePlatformStandaloneUsersServiceData<User> = DomainEntityServiceDefaultData<User> & {
  Create: DomainCoursePlatformStandaloneUsersServiceCreateData<User>;
  Update: DomainCoursePlatformStandaloneUsersServiceUpdateData<User>;
};

export type DomainCoursePlatformStandaloneUsersServiceUpdateData<User> = DomainUpdateData<User> &
  DataDBUsersUpdateUserData;

export type DomainCoursePlatformStandaloneUsersGetUserWithPermissionsDataOptions =
  IAMUsersGetUserWithPermissionsDataOptions;

export type DomainCoursePlatformStandaloneUsersGetUserWithPermissionsDataPrivateOptions =
  IAMUsersGetUserWithPermissionsDataPrivateOptions;
