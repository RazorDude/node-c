import { DomainBaseAdditionalServiceOptionsOverrides, DomainDataServicesKey, GenericObject } from '@node-c/core';

import { IsArray, IsNotEmptyObject, IsObject, IsOptional } from 'class-validator';

/*
 * We need the Options type here, so we can easily extend overriden classes' BaseDto
 */
export class BaseDto<Options> {
  @IsNotEmptyObject()
  @IsObject()
  @IsOptional()
  optionsOverridesByService?: GenericObject<Partial<Options>> & DomainBaseAdditionalServiceOptionsOverrides;

  @IsArray()
  @IsOptional()
  dataServices?: DomainDataServicesKey[];
}
