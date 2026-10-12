import {
  DataDeleteOptions,
  DomainDataServicesKey,
  DomainDeleteOptions,
  type GenericObject
} from '@node-c/core';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  ValidateNested
} from 'class-validator';

import {
  BaseAdditionalServiceOptionsOverridesDto,
  BaseDto
} from './base.dto.js';

type DataDeleteOptionsWithOptionalFilters = Omit<DataDeleteOptions, 'filters'> &
  Partial<Pick<DataDeleteOptions, 'filters'>>;

export class BaseDeleteDto implements DataDeleteOptionsWithOptionalFilters {
  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  filters?: GenericObject;

  @IsBoolean()
  @IsOptional()
  returnOriginalItems?: boolean;
}

export class DeleteAdditionalServiceOptionsOverridesDto
  extends BaseDeleteDto
  implements BaseAdditionalServiceOptionsOverridesDto
{
  @IsNotEmptyObject()
  @IsOptional()
  filterByFirstServiceResultFields?: GenericObject<string>;

  @IsBoolean()
  @IsOptional()
  returnData?: boolean;

  @IsBoolean()
  @IsOptional()
  runOnNoFirstServiceResultOnly?: boolean;
}

export class DeleteDto
  extends BaseDeleteDto
  implements BaseDto, DomainDeleteOptions
{
  @IsArray()
  @IsOptional()
  dataServices?: DomainDataServicesKey[];

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  declare filters: GenericObject<unknown>;

  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => DeleteAdditionalServiceOptionsOverridesDto)
  @ValidateNested({ each: true })
  declare optionsOverridesByService?: GenericObject<DeleteAdditionalServiceOptionsOverridesDto>;
}
