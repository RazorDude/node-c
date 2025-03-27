import { DomainFindOneOptions, GenericObject } from '@node-c/core';

import { IsArray, IsObject, IsOptional } from 'class-validator';

import { BaseDto } from './base.dto';

export class FindOneDto<Options extends DomainFindOneOptions> extends BaseDto<Options> implements DomainFindOneOptions {
  @IsObject()
  filters: GenericObject<unknown>;

  @IsOptional()
  @IsArray()
  include?: string[];

  @IsOptional()
  @IsObject()
  orderBy?: GenericObject<string>;

  @IsOptional()
  @IsArray()
  select?: string[];
}
