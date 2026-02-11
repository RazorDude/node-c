import { DomainFindOptions, GenericObject, DataOrderByDirection } from '@node-c/core';

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

  @IsBooleanString()
  @IsOptional()
  individualSearch?: boolean;

  @IsObject()
  @IsOptional()
  @IsNotEmptyObject()
  orderBy?: GenericObject<DataOrderByDirection>;

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
