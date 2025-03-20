import { DomainDeleteOptions, GenericObject } from '@node-c/core';

import { IsDefined, IsObject } from 'class-validator';

import { BaseDto } from './dto.base';

export class DeleteDto<Options extends DomainDeleteOptions> extends BaseDto<Options> implements DomainDeleteOptions {
  @IsDefined()
  @IsObject()
  filters: GenericObject<unknown>;
}
