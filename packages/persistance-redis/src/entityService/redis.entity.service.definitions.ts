import {
  PersistanceCountOptions,
  PersistanceDeleteOptions,
  PersistanceFindOneOptions,
  PersistanceFindOptions,
  PersistanceUpdateOptions
} from '@node-c/core';

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionId?: string;
}

export type BulkCreateOptions = BaseOptions;

export interface CountOptions extends BaseOptions, Omit<PersistanceCountOptions, 'withDeleted'> {}

export type CreateOptions = BaseOptions;

export interface DeleteOptions extends BaseOptions, Omit<PersistanceDeleteOptions, 'softDelete'> {}

export interface FindOneOptions
  extends BaseOptions,
    Omit<PersistanceFindOneOptions, 'include' | 'orderBy' | 'select' | 'selectOperator' | 'withDeleted'> {
  requirePrimaryKeys?: boolean;
}

export interface FindOptions
  extends BaseOptions,
    Omit<PersistanceFindOptions, 'include' | 'orderBy' | 'select' | 'selectOperator' | 'withDeleted'> {
  requirePrimaryKeys?: boolean;
}

export interface UpdateOptions extends BaseOptions, PersistanceUpdateOptions {}
