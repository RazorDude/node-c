import { Type } from 'class-transformer';
import { IsDefined, IsObject, ValidateNested } from 'class-validator';

import { GenericObject, GenericObjectClass } from '../../../common/definitions';

export class UpdateDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GenericObjectClass)
  data: GenericObject<unknown>;

  @IsDefined()
  @IsObject()
  filters: GenericObject<unknown>;
}
