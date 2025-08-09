import { PersistanceFindOnePrivateOptions, PersistanceFindPrivateOptions } from '@node-c/core';

export interface UsersBaseSerachPrivateOptions {
  withPassword?: boolean;
}

export type UsersFindOnePrivateOptions = UsersBaseSerachPrivateOptions & PersistanceFindPrivateOptions;

export type UsersFindPrivateOptions = UsersBaseSerachPrivateOptions & PersistanceFindOnePrivateOptions;

export interface UsersUpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  userId: number;
}

export interface UsersUpdateUserData {
  firstName?: string;
  hasTakenIntro?: boolean;
  lastName?: string;
  profileImageKey?: string;
  phoneNumber?: string;
}
