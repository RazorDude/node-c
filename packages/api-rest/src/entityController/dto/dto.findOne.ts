import { GenericObject } from '@node-c/core';

import { IsArray, IsObject, IsOptional } from 'class-validator';

export class FindOneDto {
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
