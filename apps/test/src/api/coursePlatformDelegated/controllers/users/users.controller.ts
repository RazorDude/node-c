import { Controller, Get, Injectable, Req } from '@nestjs/common';

import {
  AccessControlContext,
  AccessControlResource,
  type RequestWithLocals
} from '@node-c/api-http';
import { type DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';
import type {
  DataDefaultData,
  DomainEntityServiceDefaultData,
  GenericObject
} from '@node-c/core';
// biome-ignore lint/style/useImportType: DI.
import { LoggerService } from '@node-c/core';

import type {
  DataDBUsersCreateUserData,
  DataDBUsersUpdateUserData
} from '../../../../data/db/entities/users/users.definitions.js';
import type { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformDelegatedUsersService } from '../../../../domain/coursePlatformDelegated/services/users/users.service.js';

@AccessControlContext('CoursePlatformUsersEntityController')
@Injectable()
@Controller('users')
export class APICoursePlatformDelegatedUsersEntityController extends RESTAPIEntityControler<
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
    logger: LoggerService
  ) {
    super(
      domainEntityService,
      RESTAPIEntityControler.getDefaultDtos<DataDBUser>(),
      logger,
      ['find', 'findOne', 'update']
    );
  }

  @AccessControlResource('findLoginLogs')
  @Get('loginLogs')
  findLoginLogs(
    @Req() req: RequestWithLocals<DataDBUser>
  ): ReturnType<DomainCoursePlatformDelegatedUsersService['findLoginLogs']> {
    return this.domainEntityService.findLoginLogs({
      ...req.query,
      filters: {
        ...((req.query as { filters: GenericObject }).filters || {}),
        userId: req.locals?.user?.id
      }
    });
  }
}
