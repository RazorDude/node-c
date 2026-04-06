import {
  AppConfigCommonDomainIAMAuthServiceConfigCompleteSettings,
  AppConfigCommonDomainIAMAuthServiceConfigInitiateSettings,
  AppConfigDomainIAMAuthenticationStep,
  GenericObject
} from '@node-c/core';

import {
  IAMAuthenticationCompleteResult,
  IAMAuthenticationInitiateResult,
  IAMAuthenticationService,
  IAMAuthenticationType
} from '../authentication';
import { IAMMFAType } from '../mfa';
import { IAMUserWithPermissionsData } from '../users';

export interface IAMAuthenticationManagerAuthenticateOptions<AuthData = unknown> {
  auth: {
    mfaType?: IAMMFAType;
    type: IAMAuthenticationType | string;
  } & AuthData;
  filters?: GenericObject;
  mainFilterField: string;
  rememberUser?: boolean;
  step?: AppConfigDomainIAMAuthenticationStep;
}

export type IAMAuthenticationManagerAuthenticateReturnData<UserData> =
  | {
      accessToken: string;
      idToken: string;
      refreshToken?: string;
      user: UserData;
    }
  | { nextStepsRequired: boolean };

export type IAMAuthenticationManagerExecuteStepData<AuthData = unknown> = Omit<
  IAMAuthenticationManagerAuthenticateOptions<AuthData>,
  'rememberUser' | 'step'
>;

export interface IAMAuthenticationManagerExecuteStepOptions<User extends object> {
  authService: IAMAuthenticationService<User, User>;
  name: AppConfigDomainIAMAuthenticationStep;
  stepConfig:
    | AppConfigCommonDomainIAMAuthServiceConfigCompleteSettings
    | AppConfigCommonDomainIAMAuthServiceConfigInitiateSettings;
}

export interface IAMAuthenticationManagerExecuteStepResult<User extends object> {
  stepResult: IAMAuthenticationCompleteResult | IAMAuthenticationInitiateResult;
  user: IAMUserWithPermissionsData<User, unknown> | null;
  userFilterField?: string | undefined;
  userFilterValue?: unknown | undefined;
}

export interface IAMAuthenticationManagerUserTokenEnityFields<UserId = unknown> {
  accessToken?: string;
  refreshToken?: string;
  userId: UserId;
  user?: IAMUserWithPermissionsData<object, unknown>;
}

export enum IAMAuthenticationManagerUserTokenUserIdentifier {
  // eslint-disable-next-line no-unused-vars
  FieldName = 'userId'
}
