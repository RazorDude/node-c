import { EntityManager } from 'typeorm';

import {
  CountOptions as CommonCountOptions,
  DeleteOptions as CommonDeleteOptions,
  FindOneOptions as CommonFindOneOptions,
  FindOptions as CommonFindOptions,
  UpdateOptions as CommonUpdateOptions
} from '../../common/entityService';

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionManager?: EntityManager;
}

export type BulkCreateOptions = BaseOptions;

export interface CountOptions extends BaseOptions, CommonCountOptions {}

export type CreateOptions = BaseOptions;

export interface DeleteOptions extends BaseOptions, CommonDeleteOptions {}

export interface FindOptions extends BaseOptions, CommonFindOptions {}

export interface FindOneOptions extends BaseOptions, CommonFindOneOptions {}

export enum PostgresErrorCode {
  // eslint-disable-next-line no-unused-vars
  UniqueViolation = '23505'
}

export interface UpdateOptions extends BaseOptions, CommonUpdateOptions {}
