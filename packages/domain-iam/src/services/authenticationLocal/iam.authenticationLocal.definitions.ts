import { AuthenticateUserAuthData, AuthenticateUserResult, AuthenticateUserUserData } from '../authentication';

export type LocalAuthenticateUserUserData<UserFields extends object> = AuthenticateUserUserData<
  {
    password: string;
  } & UserFields
>;

export interface LocalAuthenticateUserAuthData extends AuthenticateUserAuthData {
  password: string;
}

export type LocalAuthenticateUserResult = AuthenticateUserResult;

export type LocalAuthenticationUserMFAEntity<UserMFAFields extends object | undefined> = {
  code: string;
} & UserMFAFields;
