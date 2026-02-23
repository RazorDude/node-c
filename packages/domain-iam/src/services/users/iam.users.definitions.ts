import {
  AppConfigCommonDomainIAMAuthServiceConfigCompleteSettings,
  AppConfigCommonDomainIAMAuthServiceConfigInitializeSettings,
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
import { AuthorizationPoint } from '../authorization';
import { IAMMFAType } from '../mfa';

export interface IAMUsersCreateAccessTokenOptions<AuthData = unknown> {
  auth: {
    mfaType?: IAMMFAType;
    type: IAMAuthenticationType;
  } & AuthData;
  filters?: GenericObject;
  mainFilterField: string;
  rememberUser?: boolean;
  step?: AppConfigDomainIAMAuthenticationStep;
}

export type IAMUsersCreateAccessTokenReturnData<UserData> =
  | {
      accessToken: string;
      refreshToken?: string;
      user: UserData;
    }
  | { nextStepsRequired: boolean };

export type IAMUsersExecuteStepData<AuthData = unknown> = Omit<
  IAMUsersCreateAccessTokenOptions<AuthData>,
  'rememberUser' | 'step'
>;

export interface IAMUsersExecuteStepOptions<User extends object> {
  authService: IAMAuthenticationService<User, User>;
  name: AppConfigDomainIAMAuthenticationStep;
  stepConfig:
    | AppConfigCommonDomainIAMAuthServiceConfigCompleteSettings
    | AppConfigCommonDomainIAMAuthServiceConfigInitializeSettings;
}

export interface IAMUsersExecuteStepResult<User extends object> {
  stepResult: IAMAuthenticationCompleteResult | IAMAuthenticationInitiateResult;
  user: IAMUsersUserWithPermissionsData<User, unknown> | null;
  userFilterField?: string | undefined;
  userFilterValue?: unknown | undefined;
}

export interface IAMUsersGetUserWithPermissionsDataOptions extends DomainFindOnePrivateOptions {
  keepPassword?: boolean;
}

export type IAMUsersUserWithPermissionsData<UserData, AuthorizationPointId> = {
  currentAuthorizationPoints: GenericObject<AuthorizationPoint<AuthorizationPointId>>;
} & UserData;

export interface IAMUsersUserTokenEnityFields<UserId = unknown> {
  externalAccessToken?: string;
  externalRefreshToken?: string;
  refreshToken?: string;
  userId: UserId;
}

export enum IAMUsersUserTokenUserIdentifier {
  // eslint-disable-next-line no-unused-vars
  FieldName = 'userId'
}
