import crypto from 'crypto';

import { AppConfigDomainIAM, ApplicationError, ConfigProviderService, PersistanceEntityService } from '@node-c/core';

import {
  LocalAuthenticateUserAuthData,
  LocalAuthenticateUserResult,
  LocalAuthenticateUserUserData,
  LocalAuthenticationUserMFAEntity
} from './iam.authenticationLocal.definitions';

import { IAMAuthenticationService, UserMFAKnownType } from '../authentication';

export class IAMAuthenticationLocalService<
  AuthenticationUserFields extends object,
  UserMFAEntityFields extends object | undefined = undefined
> extends IAMAuthenticationService<AuthenticationUserFields> {
  constructor(
    protected configProvider: ConfigProviderService,
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected persistanceUsersMFAService?: PersistanceEntityService<
      LocalAuthenticationUserMFAEntity<UserMFAEntityFields>
    >
  ) {
    super(configProvider, moduleName);
  }

  async authenticateUser(
    userData: LocalAuthenticateUserUserData<AuthenticationUserFields>,
    authData: LocalAuthenticateUserAuthData
  ): Promise<LocalAuthenticateUserResult> {
    const { configProvider, moduleName, persistanceUsersMFAService } = this;
    const { defaultUserIdentifierField, userPasswordHMACAlgorithm, userPasswordSecret } = configProvider.config.domain[
      moduleName
    ] as AppConfigDomainIAM;
    const { mfaEnabled, password: userPassword } = userData;
    const { mfaCode, mfaType, password: authPassword } = authData;
    const userIdentifierField = authData.userIdentifierField || defaultUserIdentifierField;
    const userIdentifierValue = userData[userIdentifierField as keyof AuthenticationUserFields];
    const userMFAIdentifierField = authData.userMFAIdentifierField || userIdentifierField;
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
        `[IAMAuthenticationLocalService]: Login attempt failed for user "${userIdentifierValue}" - wrong password.`
      );
      throw new ApplicationError('Invalid user identifier or password.');
    }
    // TODO: MFA via userMFAServices
    if (mfaEnabled) {
      if (!mfaCode || mfaType !== UserMFAKnownType.Local || !persistanceUsersMFAService) {
        throw new ApplicationError('Invalid MFA code.');
      }
      const storedCodeData = await persistanceUsersMFAService.findOne({
        filters: { [userMFAIdentifierField]: userIdentifierValue }
      });
      if (!storedCodeData?.code || mfaCode !== storedCodeData?.code) {
        console.info(
          `[IAMAuthenticationLocalService]: Login attempt failed for user ${userIdentifierValue} - missing or wrong mfa code.`
        );
        throw new ApplicationError('Invalid MFA code.');
      }
    }
    return { valid: true };
  }
}
