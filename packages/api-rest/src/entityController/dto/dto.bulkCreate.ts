import { IsDefined, IsObject, ValidateNested } from 'class-validator';

import { BaseDto } from './dto.base';

import { BulkCreateBody, BulkCreateOptions } from '../rest.entity.controller.definitions';

export class BulkCreateDto<Entity, Options extends BulkCreateOptions<Entity>>
  extends BaseDto<Options>
  implements BulkCreateBody<Entity>
{
  @IsDefined()
  @IsObject()
  @ValidateNested()
  data: Entity[];
}
