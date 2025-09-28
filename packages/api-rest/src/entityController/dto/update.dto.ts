import { GenericObject } from '@node-c/core';

import { IsDefined, IsNotEmptyObject, IsObject } from 'class-validator';

import { BaseDto } from './base.dto';

import { UpdateBody, UpdateOptions } from '../rest.entity.controller.definitions';

export class UpdateDto<Entity, Options extends UpdateOptions<Entity>>
  extends BaseDto<Options>
  implements UpdateBody<Entity>
{
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  data: Partial<Entity>;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  filters: GenericObject<unknown>;
}
