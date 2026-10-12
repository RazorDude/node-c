import {
  DataFindOneOptions,
  DataOrderByDirection,
  DomainDataServicesKey,
  DomainFindOneOptions,
  type GenericObject
} from '@node-c/core';

import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  ValidateNested
} from 'class-validator';

// biome-ignore lint/correctness/noUnresolvedImports: False positive.
import { dtoTransformBoolean } from '../../utils/dtoTransformers.utils.js';

import {
  BaseAdditionalServiceOptionsOverridesDto,
  BaseDto
} from './base.dto.js';

type DataFindOneOptionsWithOptionalFilters = Omit<
  DataFindOneOptions,
  'filters'
> &
  Partial<Pick<DataFindOneOptions, 'filters'>>;

type DomainFindOneOptionsWithOptionalFilters = Omit<
  DataFindOneOptions,
  'filters'
> &
  Partial<Pick<DomainFindOneOptions, 'filters'>>;

export class BaseFindOneDto implements DataFindOneOptionsWithOptionalFilters {
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
  orderBy?: GenericObject<DataOrderByDirection>;

  @IsArray()
  @IsOptional()
  select?: string[];
}

export class FindOneAdditionalServiceOptionsOverridesDto
  extends BaseFindOneDto
  implements BaseAdditionalServiceOptionsOverridesDto
{
  @IsNotEmptyObject()
  @IsOptional()
  filterByFirstServiceResultFields?: GenericObject<string>;

  @IsBoolean()
  @IsOptional()
  @Transform(dtoTransformBoolean)
  returnData?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(dtoTransformBoolean)
  runOnNoFirstServiceResultOnly?: boolean;
}

export class FindOneDto
  extends BaseFindOneDto
  implements BaseDto, DomainFindOneOptionsWithOptionalFilters
{
  @IsArray()
  @IsOptional()
  dataServices?: DomainDataServicesKey[];

  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => FindOneAdditionalServiceOptionsOverridesDto)
  @ValidateNested({ each: true })
  declare optionsOverridesByService?: GenericObject<FindOneAdditionalServiceOptionsOverridesDto>;
}
