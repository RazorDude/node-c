export interface UsersBaseSerachPrivateOptions {
  withPassword?: boolean;
}

export type UsersFindPrivateOptions = UsersBaseSerachPrivateOptions;

export type UsersFindOnePrivateOptions = UsersBaseSerachPrivateOptions;

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
