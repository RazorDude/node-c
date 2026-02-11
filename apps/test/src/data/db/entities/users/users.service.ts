import { Inject, Injectable } from '@nestjs/common';

import {
  ApplicationError,
  ConfigProviderService,
  DataDefaultData,
  DataFindResults,
  DataUpdateResult
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
  UsersCreateUserData,
  UsersFindOnePrivateOptions,
  UsersFindPrivateOptions,
  UsersUpdatePasswordData,
  UsersUpdateUserData
} from './users.definitions';

import { User, UserEntity } from './users.entity';

// TODO: move all of the "omit password" logic to a new UsersDataEntityService in the core module
@Injectable()
export class UsersService extends TypeORMDBEntityService<
  User,
  DataDefaultData<User> & { Create: UsersCreateUserData; Update: UsersUpdateUserData }
> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: TypeORMDBRepository<User>
  ) {
    super(configProvider, qb, repository, UserEntity);
  }

  async create(data: UsersCreateUserData, options: CreateOptions, privateOptions: CreatePrivateOptions): Promise<User> {
    const createResult = await TypeORMDBEntityService.prototype.create.call(this, { ...data }, options, privateOptions);
    return createResult;
  }

  async find(options: FindOptions, privateOptions?: UsersFindPrivateOptions): Promise<DataFindResults<User>> {
    const findResults = await super.find(options);
    if (privateOptions?.withPassword) {
      return findResults;
    }
    return {
      ...findResults,
      items: findResults.items.map(item => ld.omit(item, ['password']))
    };
  }

  async findOne(options: FindOneOptions, privateOptions?: UsersFindOnePrivateOptions): Promise<User | null> {
    const item = await super.findOne(options);
    if (privateOptions?.withPassword) {
      return item;
    }
    return item ? ld.omit(item, ['password']) : item;
  }

  async update(data: UsersUpdateUserData, options: UpdateOptions): Promise<DataUpdateResult<User>> {
    const { transactionManager } = options || {};
    if (!transactionManager) {
      return this.repository.manager.transaction(tm =>
        this.update(data, { ...(options || {}), transactionManager: tm })
      );
    }
    const updateResult = await TypeORMDBEntityService.prototype.update.call(
      this,
      { ...ld.omit(data, ['assignedUserTypes', 'password'] as unknown as (keyof UsersUpdateUserData)[]) },
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
    data: UsersUpdatePasswordData,
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
