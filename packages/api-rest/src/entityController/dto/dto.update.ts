import { GenericObject } from '@node-c/core';

import { IsDefined, IsObject, ValidateNested } from 'class-validator';

import { BaseDto } from './dto.base';

import { UpdateBody, UpdateOptions } from '../rest.entity.controller.definitions';

export class UpdateDto<Entity, Options extends UpdateOptions<Entity>>
  extends BaseDto<Options>
  implements UpdateBody<Entity>
{
  @IsDefined()
  @ValidateNested()
  data: Entity;

  @IsDefined()
  @IsObject()
  filters: GenericObject<unknown>;
}
