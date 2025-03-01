import { GenericObject } from '@node-c/core';

export interface BuildQueryOptions {
  deletedColumnName?: string;
  include?: IncludeItems;
  orderBy?: OrderBy[];
  select?: string[];
  where?: { [fieldName: string]: ParsedFilter };
  withDeleted?: boolean;
}

export interface IncludeItems {
  [relationProperty: string]: string;
}

export interface OrderBy {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface ParsedFilter {
  params?: GenericObject<unknown>;
  query: string;
}

export interface SQLQueryBuilderModuleOptions {
  persistanceModuleName: string;
}
