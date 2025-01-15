import { GenericObject } from '../../../../common/definitions';
import { AccessControlPoint } from '../accessControl';

export interface GetUserWithPermissionsDataOptions {
  keepPassword?: boolean;
}

export interface User<UserId> {
  currentAccessControlPoints: GenericObject<AccessControlPoint>;
  id: UserId;
  mfaCode?: string;
  password?: string;
}

export interface UserMFAEntity<UserId> {
  code: string;
  userId: UserId;
}
