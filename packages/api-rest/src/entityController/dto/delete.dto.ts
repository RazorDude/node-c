import { DomainDeleteOptions, GenericObject } from '@node-c/core';

import { IsBoolean, IsDefined, IsNotEmptyObject, IsObject, IsOptional } from 'class-validator';

import { BaseDto } from './base.dto';

export class DeleteDto<Options extends DomainDeleteOptions> extends BaseDto<Options> implements DomainDeleteOptions {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  filters: GenericObject<unknown>;

  @IsBoolean()
  @IsOptional()
  returnOriginalItems?: boolean;
}
