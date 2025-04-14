import { AuthenticateUserAuthData, AuthenticateUserResult, AuthenticateUserUserData } from '@node-c/domain-iam';

export type OktaAuthenticateUserUserData<UserFields extends object> = Omit<
  AuthenticateUserUserData<
    {
      password: string;
    } & UserFields
  >,
  'mfaEnabled'
>;

export interface OktaAuthenticateUserAuthData
  extends Omit<AuthenticateUserAuthData, 'mfaCode' | 'mfaType' | 'userMFAIdentifierField'> {
  password: string;
}

export type OktaAuthenticateUserResult = AuthenticateUserResult;
