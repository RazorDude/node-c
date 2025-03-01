import { Controller, Injectable } from '@nestjs/common';

import { DeleteDto, FindDto, FindOneDto, RESTAPIEntityControler, UpdateDto } from '@node-c/api-rest';
import { GenericObject } from '@node-c/core';

import { IAMTokenManagerService } from '../../../../domain/iam';
import { CacheAuthToken } from '../../../../persistance/cacheAuth';

@Injectable()
@Controller('tokens')
export class AdminTokensEntityController extends RESTAPIEntityControler<
  CacheAuthToken,
  IAMTokenManagerService,
  {
    BulkCreate: GenericObject<string>[];
    Create: GenericObject<string>;
    Delete: DeleteDto;
    Find: FindDto;
    FindOne: FindOneDto;
    Update: UpdateDto;
  }
> {
  constructor(protected domainEntityService: IAMTokenManagerService) {
    super(domainEntityService, {});
  }
}
