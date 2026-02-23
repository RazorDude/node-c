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
  Oauth2 = 'ouath2'
}

export interface IAMAuthenticationCompleteResult {
  mfaUsed?: boolean;
  mfaValid?: boolean;
  valid: boolean;
}

export type IAMAuthenticationGetUserCreateAccessTokenConfigResult =
  AppConfigCommonDomainIAMAuthServiceConfigStepSettings;

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
