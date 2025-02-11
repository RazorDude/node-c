import { Controller, Get, Injectable } from '@nestjs/common';

import { DeleteDto, FindDto, FindOneDto, RESTAPIEntityControler, UpdateDto } from '@node-c/api-rest';
import { GenericObject } from '@node-c/core';

import { IAMTokenManagerService } from '../../../../domain/iam';
import { CacheToken } from '../../../../persistance/cache';

@Injectable()
@Controller('tokens')
export class AdminTokensEntityController extends RESTAPIEntityControler<
  CacheToken,
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

  @Get('test')
  async test(): Promise<unknown> {
    return await this.domainEntityService.test();
  }
}
