import { Controller, Injectable } from '@nestjs/common';

import { DeleteDto, FindDto, FindOneDto, RESTAPIEntityControler, UpdateDto } from '@node-c/api-rest';
import { GenericObject } from '@node-c/core';

import { DomainAdminUsersService } from '../../../../domain/admin';
import { CacheUser } from '../../../../persistance/cache';

@Injectable()
@Controller('users')
export class AdminUsersEntityController extends RESTAPIEntityControler<
  CacheUser,
  DomainAdminUsersService,
  {
    BulkCreate: GenericObject<string>[];
    Create: GenericObject<string>;
    Delete: DeleteDto;
    Find: FindDto;
    FindOne: FindOneDto;
    Update: UpdateDto;
  }
> {
  constructor(protected domainEntityService: DomainAdminUsersService) {
    super(domainEntityService, {});
  }
}
