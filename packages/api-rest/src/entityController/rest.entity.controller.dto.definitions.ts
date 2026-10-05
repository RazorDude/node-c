import type {
  DomainDeleteOptions,
  DomainFindOneOptions,
  DomainFindOptions
} from '@node-c/core';

import type { BulkCreateDto as BaseBulkCreateDto } from './dto/bulkCreate.dto.js';
import type { CreateDto as BaseCreateDto } from './dto/create.dto.js';
import type { DeleteDto as BaseDeleteDto } from './dto/delete.dto.js';
import type { FindDto as BaseFindDto } from './dto/find.dto.js';
import type { FindOneDto as BaseFindOneDto } from './dto/findOne.dto.js';
import type { UpdateDto as BaseUpdateDto } from './dto/update.dto.js';

import type {
  BulkCreateOptions,
  CreateOptions,
  UpdateOptions
} from './rest.entity.controller.definitions.js';

export interface DefaultDtos<Entity> {
  BulkCreate: BaseBulkCreateDto<Entity, BulkCreateOptions<Entity>>;
  Create: BaseCreateDto<Entity, CreateOptions<Entity>>;
  Delete: BaseDeleteDto<DomainDeleteOptions>;
  Find: BaseFindDto<DomainFindOptions>;
  FindOne: BaseFindOneDto<DomainFindOneOptions>;
  Update: BaseUpdateDto<Entity, UpdateOptions<Entity>>;
}
