import { GenericObject, PersistanceOrderBy } from '@node-c/core';

import { RDBEntityManager } from '../repository';

export interface BuildQueryOptions {
  currentEntityName: string;
  deletedColumnName?: string;
  entityManager: RDBEntityManager;
  include?: IncludeItems;
  orderBy?: PersistanceOrderBy[];
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
  persistanceModuleName: string;
}
