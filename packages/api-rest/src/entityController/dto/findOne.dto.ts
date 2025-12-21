import { DomainFindOneOptions, GenericObject, PersistanceOrderByDirection } from '@node-c/core';

import { IsArray, IsNotEmptyObject, IsObject, IsOptional } from 'class-validator';

import { BaseDto } from './base.dto';

type DomainFindOneOptionsWithOptionalFilters = Omit<DomainFindOneOptions, 'filters'> &
  Partial<Pick<DomainFindOneOptions, 'filters'>>;

export class FindOneDto<Options extends DomainFindOneOptionsWithOptionalFilters>
  extends BaseDto<Options>
  implements DomainFindOneOptionsWithOptionalFilters
{
  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  filters?: GenericObject<unknown>;

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
