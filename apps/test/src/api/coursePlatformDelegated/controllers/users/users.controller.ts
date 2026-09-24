import { Controller, Get, Injectable, Req } from '@nestjs/common';

import * as NodeCApiHttp from '@node-c/api-http';
import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';
import { DataDefaultData, DomainEntityServiceDefaultData, GenericObject, LoggerService } from '@node-c/core';

import {
  DataDBUsersCreateUserData,
  DataDBUsersUpdateUserData
} from '../../../../data/db/entities/users/users.definitions.js';
import { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';
import { DomainCoursePlatformDelegatedUsersService } from '../../../../domain/coursePlatformDelegated/services/users/users.service.js';

@NodeCApiHttp.AccessControlContext('CoursePlatformUsersEntityController')
@Injectable()
@Controller('users')
export class APICoursePlatformDelegatedUsersEntityController extends RESTAPIEntityControler<
  DataDBUser,
  DomainCoursePlatformDelegatedUsersService,
  DefaultDtos<DataDBUser>,
  DomainEntityServiceDefaultData<DataDBUser>,
  DataDefaultData<DataDBUser> & { Create: DataDBUsersCreateUserData; Update: DataDBUsersUpdateUserData }
> {
  constructor(domainEntityService: DomainCoursePlatformDelegatedUsersService, logger: LoggerService) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DataDBUser>(), logger, [
      'find',
      'findOne',
      'update'
    ]);
  }

  @NodeCApiHttp.AccessControlResource('findLoginLogs')
  @Get('loginLogs')
  async findLoginLogs(
    @Req() req: NodeCApiHttp.RequestWithLocals<DataDBUser>
  ): ReturnType<DomainCoursePlatformDelegatedUsersService['findLoginLogs']> {
    return this.domainEntityService.findLoginLogs({
      ...req.query,
      filters: { ...((req.query as { filters: GenericObject }).filters || {}), userId: req.locals?.user?.id }
    });
  }
}
