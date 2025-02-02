import { GenericObject } from '@node-c/core';

import { AccessControlPoint } from '../accessControl';

export interface GetUserWithPermissionsDataOptions {
  keepPassword?: boolean;
}

export interface User<UserId, AccessControlPointId> {
  currentAccessControlPoints: GenericObject<AccessControlPoint<AccessControlPointId>>;
  id: UserId;
  mfaCode?: string;
  password?: string;
}

export interface UserMFAEntity<UserId> {
  code: string;
  userId: UserId;
}
