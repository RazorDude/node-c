import { GenericObject } from '../../common/definitions';

export interface DataBulkCreatePrivateOptions extends GenericObject {
  processInputAllowedFieldsEnabled?: boolean;
}

export interface DataCountOptions {
  filters?: GenericObject;
  findAll?: boolean;
  withDeleted?: boolean;
}

export interface DataCountPrivateOptions extends GenericObject {
  allowCountWithoutFilters?: boolean;
  processFiltersAllowedFieldsEnabled?: boolean;
}

export interface DataCreatePrivateOptions {
  processInputAllowedFieldsEnabled?: boolean;
}

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

export interface DataDeletePrivateOptions extends GenericObject {
  processFiltersAllowedFieldsEnabled?: boolean;
  requirePrimaryKeys?: boolean;
}

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
  withDeleted?: boolean;
}

export interface DataFindOnePrivateOptions extends GenericObject {
  processFiltersAllowedFieldsEnabled?: boolean;
}

export interface DataFindOptions {
  filters?: GenericObject;
  findAll?: boolean;
  getTotalCount?: boolean;
  include?: string[];
  individualSearch?: boolean;
  orderBy?: GenericObject<DataOrderByDirection>;
  page?: number;
  perPage?: number;
  select?: string[];
  withDeleted?: boolean;
}

export interface DataFindPrivateOptions extends GenericObject {
  processFiltersAllowedFieldsEnabled?: boolean;
}

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
  // eslint-disable-next-line no-unused-vars
  Asc = 'ASC',
  // eslint-disable-next-line no-unused-vars
  Desc = 'DESC'
}

export enum DataSelectOperator {
  // eslint-disable-next-line no-unused-vars
  Between = '$between',
  // eslint-disable-next-line no-unused-vars
  Contains = '$contains',
  // eslint-disable-next-line no-unused-vars
  Equals = '$eq',
  // eslint-disable-next-line no-unused-vars
  GreaterThan = '$gt',
  // eslint-disable-next-line no-unused-vars
  GreaterThanOrEqual = '$gte',
  // eslint-disable-next-line no-unused-vars
  LessThan = '$lt',
  // eslint-disable-next-line no-unused-vars
  LessThanOrEqual = '$lte',
  // eslint-disable-next-line no-unused-vars
  Like = '$like',
  // eslint-disable-next-line no-unused-vars
  ILike = '$ilike',
  // eslint-disable-next-line no-unused-vars
  Not = '$not',
  // eslint-disable-next-line no-unused-vars
  Or = '$or'
}

export interface DataUpdateOptions {
  filters: GenericObject;
  returnData?: boolean;
  returnOriginalItems?: boolean;
}

export interface DataUpdatePrivateOptions extends GenericObject {
  processFiltersAllowedFieldsEnabled?: boolean;
  processInputAllowedFieldsEnabled?: boolean;
  requirePrimaryKeys?: boolean;
  withDeleted?: boolean;
}

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
  // eslint-disable-next-line no-unused-vars
  Filters = 'processFiltersAllowedFieldsEnabled',
  // eslint-disable-next-line no-unused-vars
  Input = 'processInputAllowedFieldsEnabled'
}
