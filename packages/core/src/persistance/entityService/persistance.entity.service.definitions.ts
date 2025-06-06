import { GenericObject } from '../../common/definitions';

export interface PersistanceCountOptions {
  filters?: GenericObject;
  findAll?: boolean;
  withDeleted?: boolean;
}

export interface PersistanceDeleteOptions {
  filters: GenericObject;
  returnOriginalItems?: boolean;
  softDelete?: boolean;
}

export interface PersistanceDeleteResult<Item> {
  count?: number;
  originalItems?: Item[];
}

export interface PersistanceFindOneOptions {
  filters: GenericObject;
  include?: string[];
  orderBy?: GenericObject<PersistanceOrderByDirection>;
  select?: string[];
  selectOperator?: PersistanceSelectOperator;
  withDeleted?: boolean;
}

export interface PersistanceFindOptions {
  filters?: GenericObject;
  findAll?: boolean;
  getTotalCount?: boolean;
  include?: string[];
  orderBy?: GenericObject<PersistanceOrderByDirection>;
  page?: number;
  perPage?: number;
  select?: string[];
  withDeleted?: boolean;
}

export interface PersistanceFindResults<Item> {
  items: Item[];
  more: boolean;
  page: number;
  perPage: number;
  totalCount?: number;
}

export interface PersistanceNumberItem {
  deleted?: boolean;
  value: number;
}

export interface PersistanceOrderBy {
  field: string;
  direction: PersistanceOrderByDirection;
}

export enum PersistanceOrderByDirection {
  // eslint-disable-next-line no-unused-vars
  Asc = 'ASC',
  // eslint-disable-next-line no-unused-vars
  Desc = 'DESC'
}

export enum PersistanceSelectOperator {
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

export interface PersistanceUpdateOptions {
  filters: GenericObject;
  returnData?: boolean;
  returnOriginalItems?: boolean;
}

export interface PersistanceUpdateResult<Item> {
  count?: number;
  items?: Item[];
  originalItems?: Item[];
}
