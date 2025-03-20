import { DomainPersistanceServicesKey, GenericObject } from '@node-c/core';

import { IsObject, IsOptional } from 'class-validator';

/*
 * We need the Options type here, so we can easily extend overriden classes' BaseDto
 */
export class BaseDto<Options> {
  @IsOptional()
  @IsObject()
  optionsOverridesByService?: GenericObject<Partial<Options>>;

  @IsOptional()
  @IsObject()
  persistanceServices?: DomainPersistanceServicesKey[];
}
