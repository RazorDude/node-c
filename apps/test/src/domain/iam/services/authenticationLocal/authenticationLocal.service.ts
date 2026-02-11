import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants } from '@node-c/core';
import {
  IAMAuthenticationLocalService as BaseAuthenticationLocalService,
  LocalAuthenticateUserAuthData,
  LocalAuthenticateUserResult,
  LocalAuthenticateUserUserData
} from '@node-c/domain-iam';

import { IAMAuthenticationLocalUserFields } from './authenticationLocal.service.definitions';

import { AuditUserLoginLogsService } from '../../../../data/audit/entities';

@Injectable()
export class IAMAuthenticationLocalService extends BaseAuthenticationLocalService<IAMAuthenticationLocalUserFields> {
  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(Constants.DOMAIN_MODULE_NAME)
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: AuditUserLoginLogsService
  ) {
    super(configProvider, moduleName);
  }

  async authenticateUser(
    userData: LocalAuthenticateUserUserData<IAMAuthenticationLocalUserFields>,
    authData: LocalAuthenticateUserAuthData
  ): Promise<LocalAuthenticateUserResult> {
    const result = await super.authenticateUser(userData, authData);
    await this.userLoginLogsService.create({
      datetime: new Date()
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, ''),
      userId: userData.id
    });
    return result;
  }
}
