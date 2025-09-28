import { DomainDeleteOptions, GenericObject } from '@node-c/core';

import { IsDefined, IsNotEmptyObject, IsObject } from 'class-validator';

import { BaseDto } from './base.dto';

export class DeleteDto<Options extends DomainDeleteOptions> extends BaseDto<Options> implements DomainDeleteOptions {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  filters: GenericObject<unknown>;
}
