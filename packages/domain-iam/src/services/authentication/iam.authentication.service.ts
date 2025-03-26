import { ApplicationError, ConfigProviderService } from '@node-c/core';

import {
  AuthenticateUserAuthData,
  AuthenticateUserResult,
  AuthenticateUserUserData
} from './iam.authentication.definitions';

// TODO: generic MFA, allowing external services
export class IAMAuthenticationService<UserFields extends object> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  async authenticateUser(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userData: AuthenticateUserUserData<UserFields>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _authData: AuthenticateUserAuthData
  ): Promise<AuthenticateUserResult> {
    throw new ApplicationError('[IAMAuthenticationService]: Method "authenticateUser" not implemented.');
  }
}
