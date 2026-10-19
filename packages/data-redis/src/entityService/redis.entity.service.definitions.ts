import {
  DataBulkCreatePrivateOptions,
  DataCountOptions,
  DataCountPrivateOptionsBase,
  DataCreatePrivateOptions,
  DataDeleteOptions,
  DataDeletePrivateOptions,
  DataFindOneOptions,
  DataFindOnePrivateOptionsBase,
  DataFindOptions,
  DataFindPrivateOptionsBase,
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
  ttl?: number;
  validate?: boolean;
}

export type CountOptions = DataCountOptions;

export type CountPrivateOptions = Omit<
  DataCountPrivateOptionsBase,
  'withDeleted'
>;

export type CreateOptions = BaseCreateOptions;

export interface CreatePrivateOptions extends DataCreatePrivateOptions {
  ttl?: number;
  validate?: boolean;
}

export interface DeleteOptions
  extends BaseOptions,
    Omit<DataDeleteOptions, 'softDelete'> {}

export type DeletePrivateOptions = DataDeletePrivateOptions;

export interface FindOneOptions
  extends BaseOptions,
    Omit<
      DataFindOneOptions,
      'include' | 'orderBy' | 'select' | 'selectOperator'
    > {}

export interface FindOnePrivateOptions
  extends Omit<DataFindOnePrivateOptionsBase, 'withDeleted'> {
  requirePrimaryKeys?: boolean;
}

export interface FindOptions
  extends BaseOptions,
    Omit<DataFindOptions, 'include' | 'select' | 'selectOperator'> {}

export interface FindPrivateOptions
  extends Omit<DataFindPrivateOptionsBase, 'withDeleted'> {
  requirePrimaryKeys?: boolean;
}

export interface ServiceSaveOptions {
  delete?: boolean;
  generatePrimaryKeys: boolean;
  processObjectAllowedFieldsEnabled?: boolean;
  transactionId?: string;
  ttl?: number;
  validate?: boolean;
}

export interface UpdateOptions extends BaseCreateOptions, DataUpdateOptions {}

export interface UpdatePrivateOptions extends DataUpdatePrivateOptions {
  ttl?: number;
  validate?: boolean;
}
