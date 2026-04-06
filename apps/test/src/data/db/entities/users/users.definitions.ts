import { DataDefaultData, DataFindOnePrivateOptions, DataFindPrivateOptions, DataRelationItem } from '@node-c/core';

export interface DataDBUsersBaseSerachPrivateOptions {
  withPassword?: boolean;
}

export interface DataDBUsersCreateUserData {
  assignedUserTypes: DataRelationItem<{ id: number }>[];
  email: string;
  firstName: string;
  initialPassword: string;
  lastName: string;
  phoneNumber?: string;
}

export type DataDBUsersDataEntityServiceData<User> = DataDefaultData<User> & {
  Create: DataDBUsersCreateUserData;
  Update: DataDBUsersUpdateUserData;
};

export type DataDBUsersFindOnePrivateOptions = DataDBUsersBaseSerachPrivateOptions & DataFindPrivateOptions;

export type DataDBUsersFindPrivateOptions = DataDBUsersBaseSerachPrivateOptions & DataFindOnePrivateOptions;

export interface DataDBUsersUpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  userId: number;
}

export interface DataDBUsersUpdateUserData {
  assignedUserTypes?: DataRelationItem<{ id: number }>[];
  firstName?: string;
  hasTakenIntro?: boolean;
  lastName?: string;
  profileImageKey?: string;
  phoneNumber?: string;
}
