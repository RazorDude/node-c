import {
  CountOptions as CommonCountOptions,
  DeleteOptions as CommonDeleteOptions,
  FindOneOptions as CommonFindOneOptions,
  FindOptions as CommonFindOptions,
  UpdateOptions as CommonUpdateOptions
} from '../../common/entityService';

export interface BaseOptions {
  forceTransaction?: boolean;
  transactionId?: string;
}

export type BulkCreateOptions = BaseOptions;

export interface CountOptions extends BaseOptions, Omit<CommonCountOptions, 'withDeleted'> {}

export type CreateOptions = BaseOptions;

export interface DeleteOptions extends BaseOptions, Omit<CommonDeleteOptions, 'softDelete'> {}

export interface FindOneOptions
  extends BaseOptions,
    Omit<CommonFindOneOptions, 'include' | 'orderBy' | 'select' | 'selectOperator' | 'withDeleted'> {
  requirePrimaryKeys: boolean;
}

export interface FindOptions
  extends BaseOptions,
    Omit<CommonFindOptions, 'include' | 'orderBy' | 'select' | 'selectOperator' | 'withDeleted'> {
  requirePrimaryKeys: boolean;
}

export interface ServiceOptions {
  entityStoreName: string;
}

export interface UpdateOptions extends BaseOptions, CommonUpdateOptions {}
