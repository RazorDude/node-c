import type { DataOrderBy, GenericObject } from '@node-c/core';

import type { RDBEntityManager } from '../repository/rdb.repository.js';

export interface BuildQueryOptions {
  currentEntityName: string;
  deletedColumnName?: string;
  entityManager: RDBEntityManager;
  include?: IncludeItems;
  orderBy?: DataOrderBy[];
  select?: string[];
  where?: GenericObject<ParsedFilter>;
  withDeleted?: boolean;
  withDeletedPerRelation?: GenericObject<boolean>;
}

export interface IncludeItems {
  [relationProperty: string]: string;
}

export interface ParsedFilter {
  params?: GenericObject<unknown>;
  query: string;
}

export interface SQLQueryBuilderModuleOptions {
  dataModuleName: string;
}
