import {
  DataUpdateOptions,
  DomainDataServicesKey,
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

import { UpdateBody } from '../rest.entity.controller.definitions.js';

import {
  BaseAdditionalServiceOptionsOverridesDto,
  BaseDto
} from './base.dto.js';

type DataUpdateOptionsWithOptionalFilters = Omit<DataUpdateOptions, 'filters'> &
  Partial<Pick<DataUpdateOptions, 'filters'>>;

export class BaseUpdateDto implements DataUpdateOptionsWithOptionalFilters {
  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  filters?: GenericObject<unknown>;

  @IsOptional()
  @IsBoolean()
  returnData?: boolean;
}

export class UpdateAdditionalServiceOptionsOverridesDto
  extends BaseUpdateDto
  implements BaseAdditionalServiceOptionsOverridesDto
{
  @IsNotEmptyObject()
  @IsOptional()
  filterByFirstServiceResultFields?: GenericObject<string>;

  @IsBoolean()
  @IsOptional()
  runOnNoFirstServiceResultOnly?: boolean;
}

export class UpdateDto<Entity>
  extends BaseUpdateDto
  implements BaseDto, UpdateBody<Entity>
{
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  data: Partial<Entity>;

  @IsArray()
  @IsOptional()
  dataServices?: DomainDataServicesKey[];

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  declare filters: GenericObject<unknown>;

  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => UpdateAdditionalServiceOptionsOverridesDto)
  @ValidateNested({ each: true })
  declare optionsOverridesByService?: GenericObject<UpdateAdditionalServiceOptionsOverridesDto>;
}
