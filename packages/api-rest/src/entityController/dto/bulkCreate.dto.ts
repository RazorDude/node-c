import { IsArray, IsDefined, IsNotEmptyObject } from 'class-validator';

import { BaseDto } from './base.dto';

import { BulkCreateBody, BulkCreateOptions } from '../rest.entity.controller.definitions';

export class BulkCreateDto<Entity, Options extends BulkCreateOptions<Entity>>
  extends BaseDto<Options>
  implements BulkCreateBody<Entity>
{
  @IsArray()
  @IsDefined()
  @IsNotEmptyObject()
  data: Partial<Entity>[];
}
