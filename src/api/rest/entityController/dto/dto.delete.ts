import { IsDefined, IsObject } from 'class-validator';

import { GenericObject } from '../../../../common/definitions';

export class DeleteDto {
  @IsDefined()
  @IsObject()
  filters: GenericObject<unknown>;
}
