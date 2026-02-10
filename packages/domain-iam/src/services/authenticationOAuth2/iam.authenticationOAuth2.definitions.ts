import { AuthenticateUserAuthData, AuthenticateUserResult, AuthenticateUserUserData } from '../authentication';

export type OAuth2AuthenticateUserUserData<UserFields extends object> = AuthenticateUserUserData<UserFields>;

export interface OAuth2AuthenticateUserAuthData extends AuthenticateUserAuthData {
  authorizationCode: string;
  challengeCode: string;
  challengeVerifier: string;
}

export interface OAuth2AuthenticateUserResult extends AuthenticateUserResult {
  accessCode: string;
}

export interface OAuth2GenerateAuthorizationURL {
  authorizationCodeRequestURL: string;
  codeChallenge: string;
}
