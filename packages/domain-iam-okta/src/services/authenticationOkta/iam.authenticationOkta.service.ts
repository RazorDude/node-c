import crypto from 'crypto';

import { AppConfigDomainIAM, ApplicationError, ConfigProviderService, PersistanceEntityService } from '@node-c/core';
import { IAMAuthenticationService, UserMFAKnownType } from '@node-c/domain-iam';

import {
  OktaAuthenticateUserAuthData,
  OktaAuthenticateUserResult,
  OktaAuthenticateUserUserData
} from './iam.authenticationOkta.definitions';

export class IAMAuthenticationOktaService<
  AuthenticationUserFields extends object
> extends IAMAuthenticationService<AuthenticationUserFields> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected moduleName: string
  ) {
    super(configProvider, moduleName);
  }

  async authenticateUser(
    userData: OktaAuthenticateUserUserData<AuthenticationUserFields>,
    authData: OktaAuthenticateUserAuthData
  ): Promise<OktaAuthenticateUserResult> {
    const { configProvider, moduleName } = this;
    const { defaultUserIdentifierField, userPasswordHMACAlgorithm, userPasswordSecret } = configProvider.config.domain[
      moduleName
    ] as AppConfigDomainIAM;
    const { password: userPassword } = userData;
    const { password: authPassword } = authData;
    const userIdentifierField = authData.userIdentifierField || defaultUserIdentifierField;
    const userIdentifierValue = userData[userIdentifierField as keyof AuthenticationUserFields];
    let wrongPassword = false;
    if (!userPasswordHMACAlgorithm || !userPasswordSecret || !userPassword) {
      wrongPassword = true;
    } else {
      const computedPassword = crypto
        .createHmac(userPasswordHMACAlgorithm, userPasswordSecret)
        .update(`${authPassword}`)
        .digest('hex')
        .toString();
      if (computedPassword !== userPassword) {
        wrongPassword = true;
      }
    }
    if (wrongPassword) {
      console.info(
        `[IAMAuthenticationOktaService]: Login attempt failed for user "${userIdentifierValue}" - wrong password.`
      );
      throw new ApplicationError('Invalid user identifier or password.');
    }
    return { valid: true };
  }
}
