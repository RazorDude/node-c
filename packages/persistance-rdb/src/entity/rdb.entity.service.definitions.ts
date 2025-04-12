import {
  PersistanceCountOptions,
  PersistanceDeleteOptions,
  PersistanceFindOneOptions,
  PersistanceFindOptions,
  PersistanceUpdateOptions
} from '@node-c/core';

import { RDBEntityManager } from '../repository';

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionManager?: RDBEntityManager;
}

export type BulkCreateOptions = BaseOptions;

export interface CountOptions extends BaseOptions, PersistanceCountOptions {}

export type CreateOptions = BaseOptions;

export interface DeleteOptions extends BaseOptions, PersistanceDeleteOptions {}

export interface FindOptions extends BaseOptions, PersistanceFindOptions {}

export interface FindOneOptions extends BaseOptions, PersistanceFindOneOptions {}

export enum PostgresErrorCode {
  // eslint-disable-next-line no-unused-vars
  UniqueViolation = '23505'
}

export interface UpdateOptions extends BaseOptions, PersistanceUpdateOptions {}
