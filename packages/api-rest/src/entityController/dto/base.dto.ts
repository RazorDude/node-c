import { DomainDataServicesKey, type GenericObject } from '@node-c/core';

import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmptyObject,
  IsOptional,
  ValidateNested
} from 'class-validator';

import { dtoTransformBoolean } from '../../utils/dtoTransformers.utils.js';
// import { RewriteValidationOptions } from '../../utils/updateableValidationPipe.utils.js';

// Commented this out in favor of manually setting it up in the validation processor in the controller.
// @RewriteValidationOptions({ whitelist: false })
export class BaseAdditionalServiceOptionsOverridesDto {
  @IsNotEmptyObject()
  @IsOptional()
  // Unfortunately, this does not work on properties.
  // @RewriteValidationOptions({ whitelist: false })
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

/**
 * We need the Options type here, so we can easily extend overriden classes' BaseDto
 */
export class BaseDto {
  @IsArray()
  @IsOptional()
  dataServices?: DomainDataServicesKey[];

  /** Unfortunately, class-validator doesn't seem to be working for nested objects. The validation has been rewritten manually in the RestEntityController. */
  @IsNotEmptyObject()
  @IsOptional()
  @Type(() => BaseAdditionalServiceOptionsOverridesDto)
  @ValidateNested({ each: true })
  optionsOverridesByService?: GenericObject<BaseAdditionalServiceOptionsOverridesDto>;
}
