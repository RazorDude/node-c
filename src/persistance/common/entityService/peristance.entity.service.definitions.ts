import { GenericObject } from '../../../common/definitions';

export interface CountOptions {
  filters?: GenericObject;
  findAll?: boolean;
  withDeleted?: boolean;
}

export interface DeleteOptions {
  filters: GenericObject;
  softDelete?: boolean;
}

export interface DeleteResult {
  count?: number;
}

export interface FindOneOptions {
  filters: GenericObject;
  include?: string[];
  orderBy?: GenericObject<string>;
  select?: string[];
  selectOperator?: SelectOperator;
  withDeleted?: boolean;
}

export interface FindOptions {
  filters?: GenericObject;
  findAll?: boolean;
  include?: string[];
  orderBy?: GenericObject<string>;
  page?: number;
  perPage?: number;
  select?: string[];
  withDeleted?: boolean;
}

export interface FindResults<Item> {
  items: Item[];
  more: boolean;
  page: number;
  perPage: number;
}

export interface NumberItem {
  deleted?: boolean;
  value: number;
}

export enum SelectOperator {
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

export interface UpdateOptions {
  filters: GenericObject;
  returnData?: boolean;
}

export interface UpdateResult<Item> {
  count?: number;
  items?: Item[];
}
