import { Inject, Injectable } from '@nestjs/common';

import { ApplicationError, ConfigProviderService } from '@node-c/core';
import { Constants } from '@node-c/persistance-rdb';

import { DataSource, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';

import { User } from './users.entity';
import { UsersService } from './users.service';

// TODO: move the password properties logic away and into the domain
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    @Inject(ConfigProviderService)
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.RDB_REPOSITORY_DATASOURCE)
    protected readonly dataSource: DataSource,
    @Inject(UsersService)
    // eslint-disable-next-line no-unused-vars
    protected usersService: UsersService
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): string {
    return (this.usersService.getEntityTarget() as string) || '';
  }

  async beforeInsert(event: InsertEvent<User & { plainTextPassword?: string }>): Promise<void> {
    const { plainTextPassword } = event.entity;
    if (plainTextPassword) {
      // validate password length and content password
      if (!plainTextPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)) {
        throw new ApplicationError(
          'The password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter and 1 number.'
        );
      }
    }
  }

  async beforeUpdate(event: UpdateEvent<User & { plainTextPassword?: string }>): Promise<void> {
    const { plainTextPassword } = event.entity || {};
    if (plainTextPassword) {
      // validate password length and content password
      if (!plainTextPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)) {
        throw new ApplicationError(
          'The password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter and 1 number.'
        );
      }
    }
  }
}
