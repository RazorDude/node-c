import { GenericObject } from '../../common/definitions/common.definitions.js';

export interface DataBulkCreatePrivateOptionsBase {
  processInputAllowedFieldsEnabled?: boolean;
}

export type DataBulkCreatePrivateOptions = DataBulkCreatePrivateOptionsBase &
  GenericObject;

export interface DataCountOptions {
  filters?: GenericObject;
  findAll?: boolean;
  include?: string[];
}

export interface DataCountPrivateOptionsBase {
  allowCountWithoutFilters?: boolean;
  processFiltersAllowedFieldsEnabled?: boolean;
  withDeleted?: boolean;
}

export type DataCountPrivateOptions = DataCountPrivateOptionsBase &
  GenericObject;

export interface DataCreatePrivateOptionsBase {
  processInputAllowedFieldsEnabled?: boolean;
}

export type DataCreatePrivateOptions = DataCreatePrivateOptionsBase &
  GenericObject;

export interface DataDefaultData<Entity> {
  BulkCreate: Partial<Entity>[];
  Create: Partial<Entity>;
  Update: Partial<Entity>;
}

export interface DataDeleteOptions {
  filters: GenericObject;
  returnOriginalItems?: boolean;
  softDelete?: boolean;
}

export interface DataDeletePrivateOptionsBase {
  processFiltersAllowedFieldsEnabled?: boolean;
  requirePrimaryKeys?: boolean;
}

export type DataDeletePrivateOptions = DataDeletePrivateOptionsBase &
  GenericObject;

export interface DataDeleteResult<Item> {
  count?: number;
  originalItems?: Item[];
}

export interface DataFindOneOptions {
  filters: GenericObject;
  include?: string[];
  orderBy?: GenericObject<DataOrderByDirection>;
  select?: string[];
  selectOperator?: DataSelectOperator;
}

export interface DataFindOnePrivateOptionsBase {
  processFiltersAllowedFieldsEnabled?: boolean;
  withDeleted?: boolean;
}

export type DataFindOnePrivateOptions = DataFindOnePrivateOptionsBase &
  GenericObject;

export interface DataFindOptions {
  filters?: GenericObject;
  findAll?: boolean;
  include?: string[];
  individualSearch?: boolean;
  orderBy?: GenericObject<DataOrderByDirection>;
  page?: number;
  perPage?: number;
  select?: string[];
}

export interface DataFindPrivateOptionsBase {
  getTotalCount?: boolean;
  processFiltersAllowedFieldsEnabled?: boolean;
  withDeleted?: boolean;
}

export type DataFindPrivateOptions = DataFindPrivateOptionsBase & GenericObject;

export interface DataFindResults<Item> {
  items: Item[];
  more: boolean;
  page: number;
  perPage: number;
  totalCount?: number;
}

export type DataRelationItem<Data> = {
  deleted?: boolean;
} & Data;

export interface DataOrderBy {
  field: string;
  direction: DataOrderByDirection;
}

export enum DataOrderByDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum DataSelectOperator {
  And = '$and',
  Between = '$between',
  Contains = '$contains',
  Equals = '$eq',
  GreaterThan = '$gt',
  GreaterThanOrEqual = '$gte',
  LessThan = '$lt',
  LessThanOrEqual = '$lte',
  Like = '$like',
  ILike = '$ilike',
  Not = '$not',
  Or = '$or'
}

export interface DataUpdateOptions {
  filters: GenericObject;
  returnData?: boolean;
  returnOriginalItems?: boolean;
}

export interface DataUpdatePrivateOptionsBase {
  processFiltersAllowedFieldsEnabled?: boolean;
  processInputAllowedFieldsEnabled?: boolean;
  requirePrimaryKeys?: boolean;
  withDeleted?: boolean;
}

export type DataUpdatePrivateOptions = DataUpdatePrivateOptionsBase &
  GenericObject;

export interface DataUpdateResult<Item> {
  count?: number;
  items?: Item[];
  originalItems?: Item[];
}

export interface ProcessObjectAllowedFieldsOptions {
  allowedFields: string[];
  isEnabled?: boolean;
  objectType: string;
}

export enum ProcessObjectAllowedFieldsType {
  Filters = 'processFiltersAllowedFieldsEnabled',
  Input = 'processInputAllowedFieldsEnabled'
}
