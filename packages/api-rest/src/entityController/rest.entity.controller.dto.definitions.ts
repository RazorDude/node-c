import { DomainDeleteOptions, DomainFindOneOptions, DomainFindOptions } from '@node-c/core';

import { BulkCreateDto as BaseBulkCreateDto } from './dto/bulkCreate.dto.js';
import { CreateDto as BaseCreateDto } from './dto/create.dto.js';
import { DeleteDto as BaseDeleteDto } from './dto/delete.dto.js';
import { FindDto as BaseFindDto } from './dto/find.dto.js';
import { FindOneDto as BaseFindOneDto } from './dto/findOne.dto.js';
import { UpdateDto as BaseUpdateDto } from './dto/update.dto.js';

import { BulkCreateOptions, CreateOptions, UpdateOptions } from './rest.entity.controller.definitions.js';

export interface DefaultDtos<Entity> {
  BulkCreate: BaseBulkCreateDto<Entity, BulkCreateOptions<Entity>>;
  Create: BaseCreateDto<Entity, CreateOptions<Entity>>;
  Delete: BaseDeleteDto<DomainDeleteOptions>;
  Find: BaseFindDto<DomainFindOptions>;
  FindOne: BaseFindOneDto<DomainFindOneOptions>;
  Update: BaseUpdateDto<Entity, UpdateOptions<Entity>>;
}
