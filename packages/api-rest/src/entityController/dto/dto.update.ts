import { GenericObject, GenericObjectClass } from '@node-c/core';

import { Type } from 'class-transformer';
import { IsDefined, IsObject, ValidateNested } from 'class-validator';

export class UpdateDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GenericObjectClass)
  data: GenericObject<unknown>;

  @IsDefined()
  @IsObject()
  filters: GenericObject<unknown>;
}
