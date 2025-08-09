import {
  PersistanceCountOptions,
  PersistanceDeleteOptions,
  PersistanceEntityServiceSettings,
  PersistanceFindOneOptions,
  PersistanceFindOptions,
  PersistanceUpdateOptions
} from '@node-c/core';

export interface BaseCreateOptions extends BaseOptions {
  ttl?: number;
}

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionId?: string;
}

export type BulkCreateOptions = BaseCreateOptions;

export interface CountOptions extends BaseOptions, Omit<PersistanceCountOptions, 'withDeleted'> {}

export type CreateOptions = BaseCreateOptions;

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

export interface RedisEntityServiceSettings extends PersistanceEntityServiceSettings {
  validationSupported?: boolean;
}

export interface UpdateOptions extends BaseCreateOptions, PersistanceUpdateOptions {}
