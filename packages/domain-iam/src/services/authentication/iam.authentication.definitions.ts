export type AuthenticateUserUserData<UserFields extends object> = {
  mfaEnabled?: boolean;
} & UserFields;

export interface AuthenticateUserAuthData {
  mfaCode?: string;
  mfaType?: UserMFAType;
  userIdentifierField?: string;
  userMFAIdentifierField?: string;
}

export interface AuthenticateUserResult {
  valid: boolean;
}

export enum UserAuthKnownType {
  // eslint-disable-next-line no-unused-vars
  Local = 'local'
}

export type UserAuthType = UserAuthKnownType & string;

export enum UserMFAKnownType {
  // eslint-disable-next-line no-unused-vars
  Local = 'local'
}

export type UserMFAType = UserMFAKnownType & string;
