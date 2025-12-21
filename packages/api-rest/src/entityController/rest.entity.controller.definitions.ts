import {
  DomainBulkCreateData,
  DomainBulkCreateOptions,
  DomainCreateData,
  DomainCreateOptions,
  DomainDeleteOptions,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainFindOneOptions,
  DomainFindOptions,
  DomainUpdateData,
  DomainUpdateOptions,
  GenericObject,
  PersistanceEntityService
} from '@node-c/core';

import {
  BulkCreateDto as BaseBulkCreateDto,
  CreateDto as BaseCreateDto,
  DeleteDto as BaseDeleteDto,
  FindDto as BaseFindDto,
  FindOneDto as BaseFindOneDto,
  UpdateDto as BaseUpdateDto
} from './dto';

export interface BulkCreateBody<Entity> extends DomainBulkCreateOptions {
  data: DomainBulkCreateData<Entity>;
}

export type BulkCreateOptions<Entity> = Omit<BulkCreateBody<Entity>, 'data'>;

export interface CreateBody<Entity> extends DomainCreateOptions {
  data: DomainCreateData<Entity>;
}

export type CreateOptions<Entity> = Omit<CreateBody<Entity>, 'data'>;

// These types and interfaces have to be here to avoid circular dependencies.
export type DefaultDomainEntityService<Entity> = DomainEntityService<
  Entity,
  PersistanceEntityService<Entity>,
  DomainEntityServiceDefaultData<Entity>,
  Record<string, PersistanceEntityService<Partial<Entity>>>
>;

export interface DefaultDtos<Entity> {
  BulkCreate: BaseBulkCreateDto<Entity, BulkCreateOptions<Entity>>;
  Create: BaseCreateDto<Entity, CreateOptions<Entity>>;
  Delete: BaseDeleteDto<DomainDeleteOptions>;
  Find: BaseFindDto<DomainFindOptions>;
  FindOne: BaseFindOneDto<DomainFindOneOptions>;
  Update: BaseUpdateDto<Entity, UpdateOptions<Entity>>;
}

export interface UpdateBody<Entity> extends DomainUpdateOptions {
  data: DomainUpdateData<Entity>;
  filters: GenericObject<unknown>;
}

export type UpdateOptions<Entity> = Omit<UpdateBody<Entity>, 'data'>;
