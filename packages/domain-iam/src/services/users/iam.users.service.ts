import {
  AppConfigDomainIAM,
  ApplicationError,
  ConfigProviderService,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainMethod,
  PersistanceEntityService,
  PersistanceFindOneOptions
} from '@node-c/core';

import {
  CreateAccessTokenOptions,
  CreateAccessTokenReturnData,
  GetUserWithPermissionsDataOptions,
  UserTokenEnityFields,
  UserTokenUserIdentifier,
  UserWithPermissionsData
} from './iam.users.definitions';

import { IAMAuthenticationService, UserAuthType } from '../authentication';
import { IAMTokenManagerService, TokenType } from '../tokenManager';

// TODO: create user (signup); this should include password hashing
// TODO: update password (incl. hashing)
// TODO: reset password
// TODO: console.info -> logger
export class IAMUsersService<
  User extends object,
  Data extends DomainEntityServiceDefaultData<Partial<User>> = DomainEntityServiceDefaultData<Partial<User>>
> extends DomainEntityService<
  User,
  PersistanceEntityService<User>,
  Data,
  Record<string, PersistanceEntityService<Partial<User>>> | undefined
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected persistanceUsersService: PersistanceEntityService<User>,
    // eslint-disable-next-line no-unused-vars
    protected tokenManager: IAMTokenManagerService<UserTokenEnityFields>,
    // eslint-disable-next-line no-unused-vars
    protected userAuthServices: Record<UserAuthType, IAMAuthenticationService<User>>,
    protected defaultMethods: string[] = [
      DomainMethod.BulkCreate,
      DomainMethod.Create,
      DomainMethod.Delete,
      DomainMethod.Find,
      DomainMethod.FindOne,
      DomainMethod.Update
    ],
    protected additionalPersistanceEntityServices?: Record<string, PersistanceEntityService<Partial<User>>>
  ) {
    super(persistanceUsersService, defaultMethods, additionalPersistanceEntityServices);
  }

  async createAccessToken(options: CreateAccessTokenOptions): Promise<CreateAccessTokenReturnData<User>> {
    const { configProvider, moduleName } = this;
    const { accessTokenExpiryTimeInMinutes, defaultUserIdentifierField, refreshTokenExpiryTimeInMinutes } =
      configProvider.config.domain[moduleName] as AppConfigDomainIAM;
    const {
      auth: { type: authType, ...authData },
      filters,
      mainFilterField,
      rememberUser
    } = options;
    const mainFilterValue = filters[mainFilterField];
    console.info(`[Domain.${moduleName}.Users]: Login attempt for ${mainFilterField} ${mainFilterValue}...`);
    const user = await this.getUserWithPermissionsData({ filters: { ...(filters || {}) } }, { keepPassword: true });
    if (!user) {
      console.info(
        `[Domain.${moduleName}.Users]: Login attempt failed for ${mainFilterField} ${mainFilterValue} - user not found.`
      );
      throw new ApplicationError('Invalid email or password.');
    }
    const authService = this.userAuthServices[authType];
    if (!authService) {
      throw new ApplicationError('Invalid auth type.');
    }
    await authService.authenticateUser(user, { ...authData, userIdentifierField: defaultUserIdentifierField });
    if ('password' in user) {
      delete user.password;
    }
    const userIdentifierValue = user[defaultUserIdentifierField as keyof User];
    const {
      result: { token: refreshToken }
    } = await this.tokenManager.create(
      { type: TokenType.Refresh, [UserTokenUserIdentifier.FieldName]: userIdentifierValue },
      {
        expiresInMinutes: rememberUser ? undefined : refreshTokenExpiryTimeInMinutes,
        identifierDataField: UserTokenUserIdentifier.FieldName,
        persist: true,
        purgeOldFromPersistance: true
      }
    );
    const {
      result: { token: accessToken }
    } = await this.tokenManager.create(
      { refreshToken, type: TokenType.Access, [UserTokenUserIdentifier.FieldName]: userIdentifierValue },
      {
        expiresInMinutes: accessTokenExpiryTimeInMinutes,
        identifierDataField: UserTokenUserIdentifier.FieldName,
        persist: true,
        purgeOldFromPersistance: true
      }
    );
    console.info(`[Domain.${moduleName}.Users]: Login attempt successful for ${mainFilterField} ${mainFilterValue}.`);
    return { accessToken, refreshToken, user };
  }

  async getUserWithPermissionsData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PersistanceFindOneOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: GetUserWithPermissionsDataOptions
  ): Promise<UserWithPermissionsData<User, unknown> | null> {
    throw new ApplicationError(`Method ${this.moduleName}.IAMUsersService.getUserWithPermissionsData not implemented.`);
  }
}
