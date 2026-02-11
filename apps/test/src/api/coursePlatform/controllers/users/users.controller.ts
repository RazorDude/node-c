import { Controller, Get, Injectable, Req } from '@nestjs/common';

import { RequestWithLocals } from '@node-c/api-http';
import { DefaultDtos, RESTAPIEntityControler } from '@node-c/api-rest';
import { DataDefaultData, DomainEntityServiceDefaultData, GenericObject } from '@node-c/core';

import { User as DBUser, UsersCreateUserData, UsersUpdateUserData } from '../../../../data/db';
import { CoursePlatformUsersService } from '../../../../domain/coursePlatform';

@Injectable()
@Controller('users')
export class CoursePlatformUsersEntityController extends RESTAPIEntityControler<
  DBUser,
  CoursePlatformUsersService,
  DefaultDtos<DBUser>,
  DomainEntityServiceDefaultData<DBUser>,
  DataDefaultData<DBUser> & { Create: UsersCreateUserData; Update: UsersUpdateUserData }
> {
  constructor(protected domainEntityService: CoursePlatformUsersService) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DBUser>(), ['find', 'findOne', 'update']);
  }

  @Get('loginLogs')
  async findLoginLogs(@Req() req: RequestWithLocals<DBUser>): ReturnType<CoursePlatformUsersService['findLoginLogs']> {
    return this.domainEntityService.findLoginLogs({
      ...req.query,
      filters: { ...((req.query as { filters: GenericObject }).filters || {}), userId: req.locals?.user?.id }
    });
  }
}
