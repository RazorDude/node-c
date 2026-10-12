import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';

import { BulkCreateBody } from '../rest.entity.controller.definitions.js';

import { BaseDto } from './base.dto.js';

export class BulkCreateDto<Entity>
  extends BaseDto
  implements BulkCreateBody<Entity>
{
  @ArrayNotEmpty()
  @IsArray()
  @IsDefined()
  data: Partial<Entity>[];
}
