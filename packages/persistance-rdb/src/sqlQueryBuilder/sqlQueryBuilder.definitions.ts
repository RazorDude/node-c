import { GenericObject } from '@node-c/core';

export interface BuildQueryOptions {
  where?: { [fieldName: string]: ParsedFilter };
  include?: IncludeItems;
  orderBy?: OrderBy[];
  select?: string[];
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
