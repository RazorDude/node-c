import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { ApplicationError, ConfigProviderService } from '@node-c/core';

import * as bcrypt from 'bcryptjs';
import { DataSource, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';

import { User } from './users.entity';
import { UsersService } from './users.service';

@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    @Inject(ConfigProviderService)
    // eslint-disable-next-line no-unused-vars
    public configProvider: ConfigProviderService,
    @InjectDataSource()
    readonly dataSource: DataSource,
    @Inject(UsersService)
    // eslint-disable-next-line no-unused-vars
    public usersService: UsersService
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): string {
    return (this.usersService.getEntityTarget() as string) || '';
  }

  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    const plainTextPassword = event.entity.password;
    if (plainTextPassword) {
      // validate password length and content password
      if (!plainTextPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)) {
        throw new ApplicationError(
          'The password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter and 1 number.'
        );
      }
      // hash password
      event.entity.password = await bcrypt.hash(plainTextPassword.toString(), await bcrypt.genSalt(10));
    }
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    const plainTextPassword = event.entity!.password;
    if (plainTextPassword) {
      // validate password length and content password
      if (!plainTextPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)) {
        throw new ApplicationError(
          'The password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter and 1 number.'
        );
      }
      // hash password
      event.entity!.password = await bcrypt.hash(plainTextPassword.toString(), await bcrypt.genSalt(10));
    }
  }
}
