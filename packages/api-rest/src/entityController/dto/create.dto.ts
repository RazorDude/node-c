import { IsDefined, IsNotEmptyObject, IsObject } from 'class-validator';

import type {
  CreateBody,
  CreateOptions
} from '../rest.entity.controller.definitions.js';
import { BaseDto } from './base.dto.js';

export class CreateDto<Entity, Options extends CreateOptions<Entity>>
  extends BaseDto<Options>
  implements CreateBody<Entity>
{
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  data: Partial<Entity>;
}
