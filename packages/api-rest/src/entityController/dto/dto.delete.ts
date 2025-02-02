import { GenericObject } from '@node-c/core/common/definitions';

import { IsDefined, IsObject } from 'class-validator';

export class DeleteDto {
  @IsDefined()
  @IsObject()
  filters: GenericObject<unknown>;
}
