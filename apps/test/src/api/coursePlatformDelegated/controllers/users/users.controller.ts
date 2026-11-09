import { Controller, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessControlContext } from '@node-c/api-http';
import { type DefaultDtos, RESTAPIEntityController } from '@node-c/api-rest';
import {
  DataDefaultData,
  DomainEntityServiceDefaultData,
  LoggerService
} from '@node-c/core';

import {
  DataDBUsersCreateUserData,
  DataDBUsersUpdateUserData
} from '../../../../data/db/entities/users/users.definitions.js';
import { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
import { DomainCoursePlatformDelegatedUsersService } from '../../../../domain/coursePlatformDelegated/services/users/users.service.js';

@AccessControlContext('CoursePlatformUsersEntityController')
@Injectable()
@Controller('users')
export class APICoursePlatformDelegatedUsersEntityController extends RESTAPIEntityController<
  DataDBUser,
  DomainCoursePlatformDelegatedUsersService,
  DefaultDtos<DataDBUser>,
  DomainEntityServiceDefaultData<DataDBUser>,
  DataDefaultData<DataDBUser> & {
    Create: DataDBUsersCreateUserData;
    Update: DataDBUsersUpdateUserData;
  }
> {
  constructor(
    domainEntityService: DomainCoursePlatformDelegatedUsersService,
    logger: LoggerService,
    reflector: Reflector
  ) {
    super(
      domainEntityService,
      RESTAPIEntityController.getDefaultDtos<DataDBUser>(),
      logger,
      reflector,
      ['find', 'findOne', 'update']
    );
  }
}
