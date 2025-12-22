import {
  PersistanceBulkCreatePrivateOptions,
  PersistanceCountOptions,
  PersistanceCountPrivateOptions,
  PersistanceCreatePrivateOptions,
  PersistanceDeleteOptions,
  PersistanceDeletePrivateOptions,
  PersistanceFindOneOptions,
  PersistanceFindOnePrivateOptions,
  PersistanceFindOptions,
  PersistanceFindPrivateOptions,
  PersistanceUpdateOptions,
  PersistanceUpdatePrivateOptions
} from '@node-c/core';

import { RDBEntityManager } from '../repository';

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionManager?: RDBEntityManager;
}

export type BulkCreateOptions = BaseOptions;

export type BulkCreatePrivateOptions = PersistanceBulkCreatePrivateOptions;

export interface CountOptions extends BaseOptions, PersistanceCountOptions {}

export type CountPrivateOptions = PersistanceCountPrivateOptions;

export type CreateOptions = BaseOptions;

export type CreatePrivateOptions = PersistanceCreatePrivateOptions;

export interface DeleteOptions extends BaseOptions, PersistanceDeleteOptions {}

export type DeletePrivateOptions = PersistanceDeletePrivateOptions;

export interface FindOneOptions extends BaseOptions, PersistanceFindOneOptions {}

export type FindOnePrivateOptions = PersistanceFindOnePrivateOptions;

export interface FindOptions extends BaseOptions, PersistanceFindOptions {}

export type FindPrivateOptions = PersistanceFindPrivateOptions;

export enum PostgresErrorCode {
  // eslint-disable-next-line no-unused-vars
  UniqueViolation = '23505'
}

export interface ProcessManyToManyColumnSettingsItem {
  sourceColumnName: string;
  targetColumnName?: string;
}

export interface ProcessRelationsDataOptions<Entity> {
  currentEntityItem: Entity;
  transactionManager?: RDBEntityManager;
}

export interface UpdateOptions extends BaseOptions, PersistanceUpdateOptions {}

export type UpdatePrivateOptions = PersistanceUpdatePrivateOptions;
