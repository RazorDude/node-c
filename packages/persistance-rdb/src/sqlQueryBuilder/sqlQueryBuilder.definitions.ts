import { GenericObject } from '@node-c/core';

export interface IncludeItems {
  [relationProperty: string]: string;
}

export interface OrderBy {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface SQLQueryBuilderModuleOptions {
  dbConfigPath: string;
}

export interface ParsedFilter {
  params?: GenericObject<unknown>;
  query: string;
}
