import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ApplicationError, UpdateResult } from '@node-c/core';
import { RDBEntityService, SQLQueryBuilderService, UpdateOptions } from '@node-c/persistance-rdb';

import * as bcrypt from 'bcryptjs';
import { omit } from 'ramda';
import { EntityManager, Repository } from 'typeorm';

import { UpdatePasswordData, UpdateUserData } from './users.definitions';

import { User, UserEntity } from './users.entity';

@Injectable()
export class UsersService extends RDBEntityService<User> {
  constructor(
    @Inject(SQLQueryBuilderService)
    qb: SQLQueryBuilderService<User>,
    @InjectRepository(UserEntity)
    repository: Repository<User>
  ) {
    super(qb, repository);
  }

  async update(data: UpdateUserData, options: UpdateOptions): Promise<UpdateResult<User>> {
    const { transactionManager } = options || {};
    if (!transactionManager) {
      return this.repository.manager.transaction(tm => this.update(data, { ...options, transactionManager: tm }));
    }
    const updateResult = await RDBEntityService.prototype.update.call(
      this,
      { ...omit(['password'] as unknown as (keyof UpdateUserData)[], data) },
      options
    );
    return updateResult;
  }

  async updatePassword(
    data: UpdatePasswordData,
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
    if (!(await bcrypt.compare(currentPassword.toString(), user.password!))) {
      throw new ApplicationError('Invalid current password.');
    }
    if (currentPassword === newPassword) {
      throw new ApplicationError('The new password must be different than the current password.');
    }
    await RDBEntityService.prototype.update.call(
      this,
      { password: newPassword },
      { filters: { id: userId }, transactionManager }
    );
    return { success: true };
  }
}
