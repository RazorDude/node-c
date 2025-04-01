import { Controller, Injectable } from '@nestjs/common';

import { RESTAPIEntityControler } from '@node-c/api-rest';

import { CoursePlatformUsersService } from '../../../../domain/coursePlatform';
import { User as DBUser } from '../../../../persistance/db';

@Injectable()
@Controller('users')
export class CoursePlatformUsersEntityController extends RESTAPIEntityControler<DBUser, CoursePlatformUsersService> {
  constructor(protected domainEntityService: CoursePlatformUsersService) {
    super(domainEntityService, RESTAPIEntityControler.getDefaultDtos<DBUser>(), ['find', 'findOne']);
  }
}
