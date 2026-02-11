import {
  DataBulkCreatePrivateOptions,
  DataCountOptions,
  DataCountPrivateOptions,
  DataCreatePrivateOptions,
  DataDeleteOptions,
  DataDeletePrivateOptions,
  DataFindOneOptions,
  DataFindOnePrivateOptions,
  DataFindOptions,
  DataFindPrivateOptions,
  DataUpdateOptions,
  DataUpdatePrivateOptions
} from '@node-c/core';

import { RDBEntityManager } from '../repository';

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionManager?: RDBEntityManager;
}

export type BulkCreateOptions = BaseOptions;

export type BulkCreatePrivateOptions = DataBulkCreatePrivateOptions;

export interface CountOptions extends BaseOptions, DataCountOptions {}

export type CountPrivateOptions = DataCountPrivateOptions;

export type CreateOptions = BaseOptions;

export type CreatePrivateOptions = DataCreatePrivateOptions;

export interface DeleteOptions extends BaseOptions, DataDeleteOptions {}

export type DeletePrivateOptions = DataDeletePrivateOptions;

export interface FindOneOptions extends BaseOptions, DataFindOneOptions {}

export type FindOnePrivateOptions = DataFindOnePrivateOptions;

export interface FindOptions extends BaseOptions, DataFindOptions {}

export type FindPrivateOptions = DataFindPrivateOptions;

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

export interface UpdateOptions extends BaseOptions, DataUpdateOptions {}

export type UpdatePrivateOptions = DataUpdatePrivateOptions;
