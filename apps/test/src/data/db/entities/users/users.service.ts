import { Inject, Injectable } from '@nestjs/common';

import {
  ApplicationError,
  ConfigProviderService,
  DataFindResults,
  DataUpdateResult,
  LoggerService
} from '@node-c/core';
import {
  Constants,
  CreateOptions,
  CreatePrivateOptions,
  FindOneOptions,
  FindOptions,
  SQLQueryBuilderService,
  UpdateOptions
} from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import ld from 'lodash';
import { EntityManager } from 'typeorm';

import {
  DataDBUsersCreateUserData,
  DataDBUsersDataEntityServiceData,
  DataDBUsersFindOnePrivateOptions,
  DataDBUsersFindPrivateOptions,
  DataDBUsersUpdatePasswordData,
  DataDBUsersUpdateUserData
} from './users.definitions';

import { DataDBUser, DataDBUserEntity } from './users.entity';

// TODO: move all of the "omit password" logic to a new UsersDataEntityService in the core module
@Injectable()
export class DataDBUsersService extends TypeORMDBEntityService<
  DataDBUser,
  DataDBUsersDataEntityServiceData<DataDBUser>
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<DataDBUser>
  ) {
    super(configProvider, logger, qb, repository, DataDBUserEntity);
  }

  async create(
    data: DataDBUsersCreateUserData,
    options: CreateOptions,
    privateOptions: CreatePrivateOptions
  ): Promise<DataDBUser> {
    const createResult = await TypeORMDBEntityService.prototype.create.call(this, { ...data }, options, privateOptions);
    return createResult;
  }

  async find(
    options: FindOptions,
    privateOptions?: DataDBUsersFindPrivateOptions
  ): Promise<DataFindResults<DataDBUser>> {
    const findResults = await super.find(options);
    if (privateOptions?.withPassword) {
      return findResults;
    }
    return {
      ...findResults,
      items: findResults.items.map(item => ld.omit(item, ['password']))
    };
  }

  async findOne(
    options: FindOneOptions,
    privateOptions?: DataDBUsersFindOnePrivateOptions
  ): Promise<DataDBUser | null> {
    const item = await super.findOne(options);
    if (privateOptions?.withPassword) {
      return item;
    }
    return item ? ld.omit(item, ['password']) : item;
  }

  async update(data: DataDBUsersUpdateUserData, options: UpdateOptions): Promise<DataUpdateResult<DataDBUser>> {
    const { transactionManager } = options || {};
    if (!transactionManager) {
      return this.repository.manager.transaction(tm =>
        this.update(data, { ...(options || {}), transactionManager: tm })
      );
    }
    const updateResult = await TypeORMDBEntityService.prototype.update.call(
      this,
      { ...ld.omit(data, ['assignedUserTypes', 'password'] as unknown as (keyof DataDBUsersUpdateUserData)[]) },
      options
    );
    if (updateResult.items?.length === 1 && data.assignedUserTypes?.length) {
      await this.processManyToMany(
        {
          counterpartColumns: [{ sourceColumnName: 'id', targetColumnName: 'userTypeId' }],
          currentEntityColumns: [{ sourceColumnName: 'id', targetColumnName: 'userId' }],
          currentEntityItems: updateResult.items,
          items: data.assignedUserTypes,
          tableName: 'userTypeAssignedUsers'
        },
        { transactionManager }
      );
    }
    return updateResult;
  }

  // TODO: move the logic of this method to the domain-iam package
  async updatePassword(
    data: DataDBUsersUpdatePasswordData,
    options?: { transactionManager?: EntityManager }
  ): Promise<{ success: true }> {
    const { transactionManager } = options || {};
    if (!transactionManager) {
      return this.repository.manager.transaction(tm =>
        this.updatePassword(data, { ...(options || {}), transactionManager: tm })
      );
    }
    const { userId } = data;
    const currentPassword = data.currentPassword.replace(/\s/g, '');
    const newPassword = data.newPassword.replace(/\s/g, '');
    const user = await this.findOne({ filters: { id: userId }, transactionManager });
    if (!user) {
      throw new ApplicationError('User not found.');
    }
    // if (!(await bcrypt.compare(currentPassword.toString(), user.password!))) {
    //   throw new ApplicationError('Invalid current password.');
    // }
    if (currentPassword === newPassword) {
      throw new ApplicationError('The new password must be different than the current password.');
    }
    await TypeORMDBEntityService.prototype.update.call(
      this,
      { password: newPassword },
      { filters: { id: userId }, transactionManager }
    );
    return { success: true };
  }
}
