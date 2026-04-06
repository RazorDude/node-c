import { Injectable } from '@nestjs/common';

import {
  ApplicationError,
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DataDefaultData,
  DataEntityService,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  LoggerService
} from '@node-c/core';

import {
  IAMUserWithPermissionsData,
  IAMUsersGetUserWithPermissionsDataOptions,
  IAMUsersGetUserWithPermissionsDataPrivateOptions
} from './users.definitions';

@Injectable()
export class IAMUsersService<
  User extends object,
  EntityService extends DataEntityService<User, DataEntityServiceData>,
  Data extends DomainEntityServiceDefaultData<User> = DomainEntityServiceDefaultData<User>,
  AdditionalEntityServices extends
    | Record<string, DataEntityService<Partial<User>, DataDefaultData<object>>>
    | undefined = undefined,
  DataEntityServiceData extends DataDefaultData<User> = DataDefaultData<User>
> extends DomainEntityService<User, EntityService, Data, AdditionalEntityServices, DataEntityServiceData> {
  constructor(
    dataEntityService: EntityService,
    defaultMethods: string[] = DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
    logger: LoggerService,
    additionalDataEntityServices?: AdditionalEntityServices
  ) {
    super(dataEntityService, defaultMethods, logger, additionalDataEntityServices);
  }

  async getUserWithPermissionsData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: IAMUsersGetUserWithPermissionsDataOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: IAMUsersGetUserWithPermissionsDataPrivateOptions
  ): Promise<IAMUserWithPermissionsData<User, unknown> | null> {
    throw new ApplicationError('[IAMUsersService]: Method getUserWithPermissionsData not implemented.');
  }
}
