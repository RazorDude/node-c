import { Controller, Get, Injectable, Req } from '@nestjs/common';

import { AccessControlContext, AccessControlResource, RequestWithLocals } from '@node-c/api-http';
import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';
import { DataDefaultData, DomainEntityServiceDefaultData, GenericObject, LoggerService } from '@node-c/core';

import { DataDBUser, DataDBUsersCreateUserData, DataDBUsersUpdateUserData } from '../../../../data/db';
import { DomainCoursePlatformDelegatedUsersService } from '../../../../domain/coursePlatformDelegated';

@AccessControlContext('CoursePlatformUsersEntityController')
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

  @AccessControlResource('findLoginLogs')
  @Get('loginLogs')
  async findLoginLogs(
    @Req() req: RequestWithLocals<DataDBUser>
  ): ReturnType<DomainCoursePlatformDelegatedUsersService['findLoginLogs']> {
    return this.domainEntityService.findLoginLogs({
      ...req.query,
      filters: { ...((req.query as { filters: GenericObject }).filters || {}), userId: req.locals?.user?.id }
    });
  }
}
