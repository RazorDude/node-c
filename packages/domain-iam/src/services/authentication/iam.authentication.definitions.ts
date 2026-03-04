import { AppConfigCommonDomainIAMAuthServiceConfigStepSettings } from '@node-c/core';

import { IAMMFAType } from '../mfa';

export interface IAMAuthenticationCompleteData {
  mfaData?: unknown;
  mfaType?: IAMMFAType;
}

export interface IAMAuthenticationCompleteOptions<Context> {
  context: Context;
  contextIdentifierField?: string;
  mfaOptions?: unknown;
}

export enum IAMAuthenticationType {
  // eslint-disable-next-line no-unused-vars
  Local = 'local',
  // eslint-disable-next-line no-unused-vars
  OAuth2 = 'ouath2'
}

export interface IAMAuthenticationCompleteResult {
  accessToken?: string;
  accessTokenExpiresIn?: number;
  idToken?: string;
  mfaUsed?: boolean;
  mfaValid?: boolean;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
  valid: boolean;
}

export type IAMAuthenticationGetUserCreateAccessTokenConfigResult =
  AppConfigCommonDomainIAMAuthServiceConfigStepSettings;

export interface IAMAuthenticationGetPayloadsFromExternalTokensData {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
}

export interface IAMAuthenticationGetPayloadsFromExternalTokensResult {
  accessTokenPayload?: unknown;
  idTokenPayload?: unknown;
  refreshTokenPayload?: unknown;
}

export interface IAMAuthenticationGetUserDataFromExternalTokenPayloadsData {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
}

export interface IAMAuthenticationInitiateData {
  mfaData?: unknown;
  mfaType?: IAMMFAType;
}

export interface IAMAuthenticationInitiateOptions<Context> {
  context: Context;
  contextIdentifierField?: string;
  mfaOptions?: unknown;
}

export interface IAMAuthenticationInitiateResult {
  mfaUsed?: boolean;
  mfaValid?: boolean;
  valid: boolean;
}

export interface IAMAuthenticationRefreshExternalAccessTokenData {
  accessToken: string;
  refreshToken: string;
}

export interface IAMAuthenticationRefreshExternalAccessTokenResult {
  error?: string;
  newAccessToken?: string;
  newRefreshToken?: string;
}

export interface IAMAuthenticationVerifyExternalAccessTokenData {
  accessToken: string;
  refreshToken?: string;
}

export interface IAMAuthenticationVerifyExternalAccessTokenResult {
  accessTokenPayload?: unknown;
  error?: unknown;
  newAccessToken?: string;
  newRefreshToken?: string;
  refreshTokenPayload?: unknown;
}
