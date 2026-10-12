import { IsDefined, IsNotEmptyObject, IsObject } from 'class-validator';

import { CreateBody } from '../rest.entity.controller.definitions.js';

import { BaseDto } from './base.dto.js';

export class CreateDto<Entity> extends BaseDto implements CreateBody<Entity> {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  data: Partial<Entity>;
}
