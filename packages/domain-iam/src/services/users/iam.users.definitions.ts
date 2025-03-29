import { GenericObject } from '@node-c/core';

import { UserAuthType, UserMFAType } from '../authentication';
import { AuthorizationPoint } from '../authorization';

export interface CreateAccessTokenOptions<AuthData = unknown> {
  auth: {
    mfaType?: UserMFAType;
    type: UserAuthType;
  } & AuthData;
  filters: GenericObject;
  mainFilterField: string;
  rememberUser?: boolean;
}

export interface CreateAccessTokenReturnData<UserData> {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

export interface GetUserWithPermissionsDataOptions {
  keepPassword?: boolean;
}

export type UserWithPermissionsData<UserData, AuthorizationPointId> = {
  currentAuthorizationPoints: GenericObject<AuthorizationPoint<AuthorizationPointId>>;
} & UserData;

export interface UserTokenEnityFields<UserId = unknown> {
  refreshToken?: string;
  userId: UserId;
}

export enum UserTokenUserIdentifier {
  // eslint-disable-next-line no-unused-vars
  FieldName = 'userId'
}
