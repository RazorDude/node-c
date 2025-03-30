import { GenericObject } from '@node-c/core';

import { IsDefined, IsNotEmptyObject, IsObject } from 'class-validator';

import { BaseDto } from './base.dto';

import { UpdateBody, UpdateOptions } from '../rest.entity.controller.definitions';

export class UpdateDto<Entity, Options extends UpdateOptions<Entity>>
  extends BaseDto<Options>
  implements UpdateBody<Entity>
{
  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  data: Entity;

  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  filters: GenericObject<unknown>;
}
