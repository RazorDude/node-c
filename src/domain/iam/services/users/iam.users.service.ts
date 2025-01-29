import * as bcrypt from 'bcryptjs';

import {
  User as BaseUser,
  UserMFAEntity as BaseUserMFAEntity,
  GetUserWithPermissionsDataOptions
} from './iam.users.definitions';

import { AppConfigDomainIAM, ConfigProviderService } from '../../../../common/configProvider';
import { ApplicationError, GenericObject } from '../../../../common/definitions';
import { FindOneOptions, PersistanceEntityService } from '../../../../persistance/common/entityService';
import { DomainPersistanceEntityService } from '../../../common/entityService';

import { IAMTokenManagerService } from '../tokenManager';

export class IAMUsersService<
  UserId,
  User extends BaseUser<UserId, unknown>,
  UserMFAEntity extends BaseUserMFAEntity<UserId> | undefined = undefined
> extends DomainPersistanceEntityService<User, PersistanceEntityService<User>> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected persistanceUsersService: PersistanceEntityService<User>,
    // eslint-disable-next-line no-unused-vars
    protected tokenManager: IAMTokenManagerService<unknown, unknown, unknown>,
    // eslint-disable-next-line no-unused-vars
    protected persistanceUsersMFAService?: PersistanceEntityService<UserMFAEntity>,
    // eslint-disable-next-line no-unused-vars
    protected persistanceUsersWithActiveAccessService?: PersistanceEntityService<User>
  ) {
    super(persistanceUsersService);
  }

  // TODO: console.info -> logger
  async createAccessToken(data: {
    email: string;
    filters?: GenericObject;
    mfaCode?: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { configProvider, moduleName, persistanceUsersMFAService, persistanceUsersWithActiveAccessService } = this;
    const moduleConfig = configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const { email, filters, password, mfaCode, rememberMe } = data;
    console.info(`[Domain.${moduleName}.Users info]: Login attempt for email ${email}...`);
    const user = await this.getUserWithPermissionsData(
      { filters: { ...(filters || {}), email } },
      { keepPassword: true }
    );
    if (!user) {
      console.info(`[Domain.${moduleName}.Users info]: Login attempt failed for email ${email} - user not found.`);
      throw new ApplicationError('Invalid email or password.');
    }
    if (!(await bcrypt.compare(password.toString(), user.password!))) {
      console.info(`[Domain.${moduleName}.Users info]: Login attempt failed for email ${email} - wrong password.`);
      throw new ApplicationError('Invalid email or password.');
    }
    if (mfaCode) {
      let mfaCodeForCheck: string | undefined;
      if (persistanceUsersMFAService) {
        const storedCodeData = await persistanceUsersMFAService.findOne({ filters: { userId: user.id } });
        mfaCodeForCheck = storedCodeData?.code;
      }
      if (!mfaCodeForCheck) {
        mfaCodeForCheck = user.mfaCode;
      }
      if (!mfaCodeForCheck || mfaCode !== mfaCodeForCheck) {
        console.info(
          `[Domain.${moduleName}.Users info]: Login attempt failed for user id ${user.id} - missing or wrong mfa code.`
        );
        throw new ApplicationError('Invalid MFA code.');
      }
    }
    delete user.password;
    const refreshToken = await this.tokenManager.createRefreshToken(
      { userId: user.id },
      {
        expiresInMinutes: moduleConfig.refreshTokenExpiryTimeInMinutes,
        identifierDataField: 'userId',
        persist: true,
        purgeOldFromPersistance: true
      }
    );
    const accessToken = await this.tokenManager.createAccessToken(
      { refreshToken, userId: user.id },
      {
        expiresInMinutes: rememberMe ? undefined : moduleConfig.accessTokenExpiryTimeInMinutes,
        identifierDataField: 'userId',
        persist: true,
        purgeOldFromPersistance: true
      }
    );
    if (persistanceUsersWithActiveAccessService) {
      await persistanceUsersWithActiveAccessService.delete({ filters: { id: user.id } });
    }
    console.info(`[Domain.${moduleName}.Users info]: Login attempt successful for email ${email}.`);
    return { accessToken, refreshToken, user };
  }

  async getUserWithPermissionsData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: FindOneOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: GetUserWithPermissionsDataOptions
  ): Promise<User | null> {
    throw new ApplicationError(`Method ${this.moduleName}.IAMUsersService.getUserWithPermissionsData not implemented.`);
  }
}
