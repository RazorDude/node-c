import {
  DomainBulkCreateData,
  DomainBulkCreateOptions,
  DomainCreateData,
  DomainCreateOptions,
  DomainUpdateData,
  DomainUpdateOptions,
  GenericObject
} from '@node-c/core';

export interface BulkCreateBody<Entity> extends DomainBulkCreateOptions {
  data: DomainBulkCreateData<Entity>;
}

export type BulkCreateOptions<Entity> = Omit<BulkCreateBody<Entity>, 'data'>;

export interface CreateBody<Entity> extends DomainCreateOptions {
  data: DomainCreateData<Entity>;
}

export type CreateOptions<Entity> = Omit<CreateBody<Entity>, 'data'>;

export interface UpdateBody<Entity> extends DomainUpdateOptions {
  data: DomainUpdateData<Entity>;
  filters: GenericObject<unknown>;
}

export type UpdateOptions<Entity> = Omit<UpdateBody<Entity>, 'data'>;
