import { DomainDeleteOptions, DomainFindOneOptions, DomainFindOptions } from '@node-c/core';

import {
  BulkCreateDto as BaseBulkCreateDto,
  CreateDto as BaseCreateDto,
  DeleteDto as BaseDeleteDto,
  FindDto as BaseFindDto,
  FindOneDto as BaseFindOneDto,
  UpdateDto as BaseUpdateDto
} from './dto';

import { BulkCreateOptions, CreateOptions, UpdateOptions } from './rest.entity.controller.definitions';

export interface DefaultDtos<Entity> {
  BulkCreate: BaseBulkCreateDto<Entity, BulkCreateOptions<Entity>>;
  Create: BaseCreateDto<Entity, CreateOptions<Entity>>;
  Delete: BaseDeleteDto<DomainDeleteOptions>;
  Find: BaseFindDto<DomainFindOptions>;
  FindOne: BaseFindOneDto<DomainFindOneOptions>;
  Update: BaseUpdateDto<Entity, UpdateOptions<Entity>>;
}
