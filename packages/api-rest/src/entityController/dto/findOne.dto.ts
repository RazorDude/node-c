import { DomainFindOneOptions, GenericObject, PersistanceOrderByDirection } from '@node-c/core';

import { IsArray, IsNotEmptyObject, IsObject, IsOptional } from 'class-validator';

import { BaseDto } from './base.dto';

export class FindOneDto<Options extends DomainFindOneOptions> extends BaseDto<Options> implements DomainFindOneOptions {
  @IsNotEmptyObject()
  @IsObject()
  filters: GenericObject<unknown>;

  @IsArray()
  @IsOptional()
  include?: string[];

  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  orderBy?: GenericObject<PersistanceOrderByDirection>;

  @IsArray()
  @IsOptional()
  select?: string[];
}
