import { AuthenticateUserAuthData, AuthenticateUserResult, AuthenticateUserUserData } from '../authentication';

export type OAuth2AuthenticateUserUserData<UserFields extends object> = AuthenticateUserUserData<UserFields>;

export interface OAuth2AuthenticateUserAuthData extends AuthenticateUserAuthData {
  code: string;
  codeVerifier: string;
}

export interface OAuth2AuthenticateUserResult extends AuthenticateUserResult {
  accessCode: string;
}

export interface OAuth2GenerateAuthorizationURLData {
  scope?: string;
}

export interface OAuth2GenerateAuthorizationURLReturnData {
  authorizationCodeRequestURL: string;
  codeChallenge: string;
  codeVerifier: string;
  state: string;
}
