import { DataFindOnePrivateOptions, DataFindPrivateOptions, DataRelationItem } from '@node-c/core';

export interface UsersBaseSerachPrivateOptions {
  withPassword?: boolean;
}

export interface UsersCreateUserData {
  assignedUserTypes: DataRelationItem<{ id: number }>[];
  email: string;
  firstName: string;
  initialPassword: string;
  lastName: string;
  phoneNumber?: string;
}

export type UsersFindOnePrivateOptions = UsersBaseSerachPrivateOptions & DataFindPrivateOptions;

export type UsersFindPrivateOptions = UsersBaseSerachPrivateOptions & DataFindOnePrivateOptions;

export interface UsersUpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  userId: number;
}

export interface UsersUpdateUserData {
  assignedUserTypes?: DataRelationItem<{ id: number }>[];
  firstName?: string;
  hasTakenIntro?: boolean;
  lastName?: string;
  profileImageKey?: string;
  phoneNumber?: string;
}
