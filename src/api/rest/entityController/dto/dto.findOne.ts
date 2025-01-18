import { IsArray, IsObject, IsOptional } from 'class-validator';

import { GenericObject } from '../../../../common/definitions';

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
