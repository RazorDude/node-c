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

export interface BaseCreateOptions extends BaseOptions {
  ttl?: number;
}

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionId?: string;
}

export type BulkCreateOptions = BaseCreateOptions;

export interface BulkCreatePrivateOptions extends PersistanceBulkCreatePrivateOptions {
  validate?: boolean;
}

export interface CountOptions extends BaseOptions, Omit<PersistanceCountOptions, 'withDeleted'> {}

export type CountPrivateOptions = PersistanceCountPrivateOptions;

export type CreateOptions = BaseCreateOptions;

export interface CreatePrivateOptions extends PersistanceCreatePrivateOptions {
  validate?: boolean;
}

export interface DeleteOptions extends BaseOptions, Omit<PersistanceDeleteOptions, 'softDelete'> {}

export type DeletePrivateOptions = PersistanceDeletePrivateOptions;

export interface FindOneOptions
  extends BaseOptions,
    Omit<PersistanceFindOneOptions, 'include' | 'orderBy' | 'select' | 'selectOperator' | 'withDeleted'> {}

export interface FindOnePrivateOptions extends PersistanceFindOnePrivateOptions {
  requirePrimaryKeys?: boolean;
}

export interface FindOptions
  extends BaseOptions,
    Omit<PersistanceFindOptions, 'include' | 'orderBy' | 'select' | 'selectOperator' | 'withDeleted'> {}

export interface FindPrivateOptions extends PersistanceFindPrivateOptions {
  requirePrimaryKeys?: boolean;
}

export interface UpdateOptions extends BaseCreateOptions, PersistanceUpdateOptions {}

export interface UpdatePrivateOptions extends PersistanceUpdatePrivateOptions {
  validate?: boolean;
}
