import {
  DataFindOptions,
  DataOrderByDirection,
  DomainDataServicesKey,
  DomainFindOptions,
  type GenericObject
} from '@node-c/core';

import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested
} from 'class-validator';

import {
  dtoTransformBoolean,
  dtoTransformNumber
  // biome-ignore lint/correctness/noUnresolvedImports: False positive.
} from '../../utils/dtoTransformers.utils.js';

import {
  BaseAdditionalServiceOptionsOverridesDto,
  BaseDto
} from './base.dto.js';

export class BaseFindDto implements DataFindOptions {
  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  filters?: GenericObject;

  @IsBoolean()
  @IsOptional()
  @Transform(dtoTransformBoolean)
  findAll?: boolean;

  @IsArray()
  @IsOptional()
  include?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(dtoTransformBoolean)
  individualSearch?: boolean;

  @IsObject()
  @IsOptional()
  @IsNotEmptyObject()
  orderBy?: GenericObject<DataOrderByDirection>;

  @IsNumber()
  @IsOptional()
  @Transform(dtoTransformNumber)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Transform(dtoTransformNumber)
  perPage?: number;

  @IsArray()
  @IsOptional()
  select?: string[];
}

export class FindAdditionalServiceOptionsOverridesDto
  extends BaseFindDto
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

export class FindDto extends BaseFindDto implements BaseDto, DomainFindOptions {
  @IsArray()
  @IsOptional()
  dataServices?: DomainDataServicesKey[];

  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => FindAdditionalServiceOptionsOverridesDto)
  @ValidateNested({ each: true })
  declare optionsOverridesByService?: GenericObject<FindAdditionalServiceOptionsOverridesDto>;
}
