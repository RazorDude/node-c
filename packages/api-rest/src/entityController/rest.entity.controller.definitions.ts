import {
  DataDefaultData,
  DataEntityService,
  DomainBulkCreateData,
  DomainBulkCreateOptions,
  DomainCreateData,
  DomainCreateOptions,
  DomainEntityService,
  DomainEntityServiceDefaultData,
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

// These types and interfaces have to be here to avoid circular dependencies.
export type DefaultDomainEntityService<
  Entity,
  DomainEntityServiceData extends DomainEntityServiceDefaultData<Entity> = DomainEntityServiceDefaultData<Entity>,
  DataEntityServiceData extends DataDefaultData<Entity> = DataDefaultData<Entity>
> = DomainEntityService<
  Entity,
  DataEntityService<Entity, DataEntityServiceData>,
  DomainEntityServiceData,
  Record<string, DataEntityService<Partial<Entity>>>,
  DataEntityServiceData
>;

export interface UpdateBody<Entity> extends DomainUpdateOptions {
  data: DomainUpdateData<Entity>;
  filters: GenericObject<unknown>;
}

export type UpdateOptions<Entity> = Omit<UpdateBody<Entity>, 'data'>;
