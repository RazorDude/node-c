import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';

import type {
  BulkCreateBody,
  BulkCreateOptions
} from '../rest.entity.controller.definitions.js';
import { BaseDto } from './base.dto.js';

export class BulkCreateDto<Entity, Options extends BulkCreateOptions<Entity>>
  extends BaseDto<Options>
  implements BulkCreateBody<Entity>
{
  @ArrayNotEmpty()
  @IsArray()
  @IsDefined()
  data: Partial<Entity>[];
}
