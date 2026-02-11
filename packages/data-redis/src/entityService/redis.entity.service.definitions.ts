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

export interface BaseCreateOptions extends BaseOptions {
  ttl?: number;
}

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionId?: string;
}

export type BulkCreateOptions = BaseCreateOptions;

export interface BulkCreatePrivateOptions extends DataBulkCreatePrivateOptions {
  validate?: boolean;
}

export interface CountOptions extends BaseOptions, Omit<DataCountOptions, 'withDeleted'> {}

export type CountPrivateOptions = DataCountPrivateOptions;

export type CreateOptions = BaseCreateOptions;

export interface CreatePrivateOptions extends DataCreatePrivateOptions {
  validate?: boolean;
}

export interface DeleteOptions extends BaseOptions, Omit<DataDeleteOptions, 'softDelete'> {}

export type DeletePrivateOptions = DataDeletePrivateOptions;

export interface FindOneOptions
  extends BaseOptions,
    Omit<DataFindOneOptions, 'include' | 'orderBy' | 'select' | 'selectOperator' | 'withDeleted'> {}

export interface FindOnePrivateOptions extends DataFindOnePrivateOptions {
  requirePrimaryKeys?: boolean;
}

export interface FindOptions
  extends BaseOptions,
    Omit<DataFindOptions, 'include' | 'orderBy' | 'select' | 'selectOperator' | 'withDeleted'> {}

export interface FindPrivateOptions extends DataFindPrivateOptions {
  requirePrimaryKeys?: boolean;
}

export interface ServiceSaveOptions {
  delete?: boolean;
  generatePrimaryKeys: boolean;
  processObjectAllowedFieldsEnabled?: boolean;
  transactionId?: string;
  validate?: boolean;
}

export interface UpdateOptions extends BaseCreateOptions, DataUpdateOptions {}

export interface UpdatePrivateOptions extends DataUpdatePrivateOptions {
  validate?: boolean;
}
