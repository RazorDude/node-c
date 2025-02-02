import { GenericObject } from '@node-c/core';

import { IsDefined, IsObject } from 'class-validator';

export class DeleteDto {
  @IsDefined()
  @IsObject()
  filters: GenericObject<unknown>;
}
