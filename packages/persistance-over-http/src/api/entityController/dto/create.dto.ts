import { IsDefined, IsNotEmptyObject, IsObject } from 'class-validator';

import { BaseDto } from './base.dto';

import { CreateBody, CreateOptions } from '../persistance.entity.controller.definitions';

export class CreateDto<Entity, Options extends CreateOptions<Entity>>
  extends BaseDto<Options>
  implements CreateBody<Entity>
{
  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  data: Entity;
}
