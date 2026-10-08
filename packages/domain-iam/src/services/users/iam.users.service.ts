/** biome-ignore-all lint/suspicious/useAwait: Abstract methods. */

import { Injectable } from '@nestjs/common';

import type {
  DataDefaultData,
  DataEntityService,
  DomainEntityServiceDefaultData
} from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import {
  ApplicationError,
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainEntityService,
  LoggerService
} from '@node-c/core';

import type {
  IAMUsersGetUserWithPermissionsDataOptions,
  IAMUsersGetUserWithPermissionsDataPrivateOptions,
  IAMUserWithPermissionsData
} from './iam.users.definitions.js';

@Injectable()
export class IAMUsersService<
  User extends object,
  EntityService extends DataEntityService<User, DataEntityServiceData>,
  Data extends
    DomainEntityServiceDefaultData<User> = DomainEntityServiceDefaultData<User>,
  AdditionalEntityServices extends
    | Record<string, DataEntityService<Partial<User>, DataDefaultData<object>>>
    | undefined = undefined,
  DataEntityServiceData extends DataDefaultData<User> = DataDefaultData<User>
> extends DomainEntityService<
  User,
  EntityService,
  Data,
  AdditionalEntityServices,
  DataEntityServiceData
> {
  constructor(
    dataEntityService: EntityService,
    // biome-ignore lint/style/useDefaultParameterLast: False positive.
    defaultMethods: string[] = DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
    logger: LoggerService,
    additionalDataEntityServices?: AdditionalEntityServices
  ) {
    super(
      dataEntityService,
      defaultMethods,
      logger,
      additionalDataEntityServices
    );
  }

  async getUserWithPermissionsData(
    _options: IAMUsersGetUserWithPermissionsDataOptions,
    _privateOptions?: IAMUsersGetUserWithPermissionsDataPrivateOptions
  ): Promise<IAMUserWithPermissionsData<User, unknown> | null> {
    throw new ApplicationError(
      '[IAMUsersService]: Method getUserWithPermissionsData not implemented.'
    );
  }
}
