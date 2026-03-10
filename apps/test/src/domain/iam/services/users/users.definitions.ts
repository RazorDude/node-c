import { DomainCreateData, DomainEntityServiceDefaultData, DomainUpdateData } from '@node-c/core';

import {
  UsersCreateUserData as DBUsersCreateUserData,
  UsersUpdateUserData as DBUsersUpdateUserData
} from '../../../../data/db';

export type IAMUsersDomainEntityServiceCreateData<User> = DomainCreateData<User> & DBUsersCreateUserData;

export type IAMUsersDomainEntityServiceData<User> = DomainEntityServiceDefaultData<User> & {
  Create: IAMUsersDomainEntityServiceCreateData<User>;
  Update: IAMUsersDomainEntityServiceUpdateData<User>;
};

export type IAMUsersDomainEntityServiceUpdateData<User> = DomainUpdateData<User> & DBUsersUpdateUserData;
