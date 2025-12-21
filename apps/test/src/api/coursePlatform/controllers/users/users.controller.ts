import { Controller, Get, Injectable, Req } from '@nestjs/common';

import { RequestWithLocals } from '@node-c/api-http';
import { RESTAPIEntityControler } from '@node-c/api-rest';
import { GenericObject } from '@node-c/core';

import { CoursePlatformUsersService } from '../../../../domain/coursePlatform';
import { User as DBUser } from '../../../../persistance/db';

@Injectable()
@Controller('users')
export class CoursePlatformUsersEntityController extends RESTAPIEntityControler<DBUser, CoursePlatformUsersService> {
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
