import {
  AppConfigCommonDomainIAMAuthServiceConfigCompleteSettings,
  AppConfigCommonDomainIAMAuthServiceConfigInitiateSettings,
  AppConfigDomainIAMAuthenticationStep,
  DomainFindOnePrivateOptions,
  GenericObject
} from '@node-c/core';

import {
  IAMAuthenticationCompleteResult,
  IAMAuthenticationInitiateResult,
  IAMAuthenticationService,
  IAMAuthenticationType
} from '../authentication';
import { AuthorizationUser } from '../authorization';
import { IAMMFAType } from '../mfa';

export interface IAMUserManagerCreateAccessTokenOptions<AuthData = unknown> {
  auth: {
    mfaType?: IAMMFAType;
    type: IAMAuthenticationType | string;
  } & AuthData;
  filters?: GenericObject;
  mainFilterField: string;
  rememberUser?: boolean;
  step?: AppConfigDomainIAMAuthenticationStep;
}

export type IAMUserManagerCreateAccessTokenReturnData<UserData> =
  | {
      accessToken: string;
      refreshToken?: string;
      user: UserData;
    }
  | { nextStepsRequired: boolean };

export type IAMUserManagerExecuteStepData<AuthData = unknown> = Omit<
  IAMUserManagerCreateAccessTokenOptions<AuthData>,
  'rememberUser' | 'step'
>;

export interface IAMUserManagerExecuteStepOptions<User extends object> {
  authService: IAMAuthenticationService<User, User>;
  name: AppConfigDomainIAMAuthenticationStep;
  stepConfig:
    | AppConfigCommonDomainIAMAuthServiceConfigCompleteSettings
    | AppConfigCommonDomainIAMAuthServiceConfigInitiateSettings;
}

export interface IAMUserManagerExecuteStepResult<User extends object> {
  stepResult: IAMAuthenticationCompleteResult | IAMAuthenticationInitiateResult;
  user: IAMUserManagerUserWithPermissionsData<User, unknown> | null;
  userFilterField?: string | undefined;
  userFilterValue?: unknown | undefined;
}

export interface IAMUserManagerGetUserWithPermissionsDataOptions extends DomainFindOnePrivateOptions {
  keepPassword?: boolean;
}

export type IAMUserManagerUserWithPermissionsData<UserData, AuthorizationPointId> =
  AuthorizationUser<AuthorizationPointId> & UserData;

export interface IAMUserManagerUserTokenEnityFields<UserId = unknown> {
  refreshToken?: string;
  userId: UserId;
  user?: IAMUserManagerUserWithPermissionsData<object, unknown>;
}

export enum IAMUserManagerUserTokenUserIdentifier {
  // eslint-disable-next-line no-unused-vars
  FieldName = 'userId'
}
