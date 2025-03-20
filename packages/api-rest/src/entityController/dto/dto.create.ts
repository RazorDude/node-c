import { IsDefined, IsObject, ValidateNested } from 'class-validator';

import { BaseDto } from './dto.base';

import { CreateBody, CreateOptions } from '../rest.entity.controller.definitions';

export class CreateDto<Entity, Options extends CreateOptions<Entity>>
  extends BaseDto<Options>
  implements CreateBody<Entity>
{
  @IsDefined()
  @IsObject()
  @ValidateNested()
  data: Entity;
}
