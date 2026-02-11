import { IsDefined, IsNotEmptyObject, IsObject } from 'class-validator';

import { BaseDto } from './base.dto';

import { BulkCreateBody, BulkCreateOptions } from '../data.entity.controller.definitions';

export class BulkCreateDto<Entity, Options extends BulkCreateOptions<Entity>>
  extends BaseDto<Options>
  implements BulkCreateBody<Entity>
{
  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  data: Entity[];
}
