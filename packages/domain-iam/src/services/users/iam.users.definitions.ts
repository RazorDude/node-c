import { GenericObject } from '@node-c/core';

import { UserAuthType, UserMFAType } from '../authentication';
import { AuthorizationPoint } from '../authorization';

export interface CreateAccessTokenLocalAuthData {
  mfaCode?: string;
  password: string;
}

export interface CreateAccessTokenOptions<AuthData = unknown> {
  auth: { type: UserAuthType; mfaType?: UserMFAType } & AuthData;
  email: string;
  filters?: GenericObject;
  rememberMe?: boolean;
}

export interface CreateAccessTokenReturnData<UserData> {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

export interface GetUserWithPermissionsDataOptions {
  keepPassword?: boolean;
}

export type User<UserIdentifierData, AuthorizationPointId> = {
  currentAuthorizationPoints: GenericObject<AuthorizationPoint<AuthorizationPointId>>;
  mfaCode?: string;
  password?: string;
} & UserIdentifierData;

export interface UserTokenEnityFields<UserId = unknown> {
  refreshToken?: string;
  userId: UserId;
}

export enum UserTokenUserIdentifier {
  // eslint-disable-next-line no-unused-vars
  FieldName = 'userId'
}
