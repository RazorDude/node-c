import { GenericObject } from '@node-c/core/common/definitions';

import { IsArray, IsBooleanString, IsNumberString, IsObject, IsOptional } from 'class-validator';

export class FindDto {
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
