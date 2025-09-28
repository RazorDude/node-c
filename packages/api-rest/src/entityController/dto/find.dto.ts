import { DomainFindOptions, GenericObject, PersistanceOrderByDirection } from '@node-c/core';

import { IsArray, IsBooleanString, IsNotEmptyObject, IsNumberString, IsObject, IsOptional } from 'class-validator';

import { BaseDto } from './base.dto';

export class FindDto<Options extends DomainFindOptions> extends BaseDto<Options> implements DomainFindOptions {
  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  filters?: GenericObject;

  @IsBooleanString()
  @IsOptional()
  findAll?: boolean;

  @IsArray()
  @IsOptional()
  include?: string[];

  @IsObject()
  @IsOptional()
  @IsNotEmptyObject()
  orderBy?: GenericObject<PersistanceOrderByDirection>;

  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  perPage?: number;

  @IsArray()
  @IsOptional()
  select?: string[];
}
