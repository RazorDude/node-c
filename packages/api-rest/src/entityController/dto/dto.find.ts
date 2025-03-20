import { DomainFindOptions, GenericObject } from '@node-c/core';

import { IsArray, IsBooleanString, IsNumberString, IsObject, IsOptional } from 'class-validator';

import { BaseDto } from './dto.base';

export class FindDto<Options extends DomainFindOptions> extends BaseDto<Options> implements DomainFindOptions {
  @IsObject()
  @IsOptional()
  filters?: GenericObject;

  @IsOptional()
  @IsBooleanString()
  findAll?: boolean;

  @IsOptional()
  @IsArray()
  include?: string[];

  @IsOptional()
  @IsObject()
  orderBy?: GenericObject<string>;

  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  perPage?: number;

  @IsOptional()
  @IsArray()
  select?: string[];
}
