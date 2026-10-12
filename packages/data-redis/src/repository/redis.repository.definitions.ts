import type { GenericObject } from '@node-c/core';

import type { ValidationSchema } from 'class-validator';

export interface EntitySchema {
  columns: {
    [columnName: string]: {
      generated?: boolean;
      isCreationDate?: boolean;
      isDeletionDate?: boolean;
      // this only works with arrays
      isInnerPrimary?: boolean;
      isUpdateDate?: boolean;
      primary?: boolean;
      primaryOrder?: number;
      type?: EntitySchemaColumnType;
      // https://www.npmjs.com/package/class-validator/v/0.6.0#defining-validation-schema-without-decorators
      validationProperties?: ValidationSchema['properties'][''];
    };
  };
  isArray?: boolean;
  name: string;
  nestedObjectContainerPath?: string;
  paranoid?: boolean;
  storeKey: string;
}

export enum EntitySchemaColumnType {
  Array = 'array',
  Boolean = 'boolean',
  Integer = 'integer',
  Object = 'object',
  String = 'string',
  TimestampTz = 'timestampTz',
  UUIDV4 = 'uuidv4'
}

export interface FilterItemOptions {
  keysToSkip?: GenericObject<boolean>;
  skippableKeysToForceCheck?: GenericObject<boolean>;
}

export interface GetValuesFromResultsOptions {
  filters?: GenericObject<unknown>;
  flattenArray?: boolean;
  hasNonPrimaryKeyFilters?: boolean;
  primaryKeyFiltersToForceCheck?: GenericObject<boolean>;
}

export interface PrepareOptions {
  generatePrimaryKeys: boolean;
  onConflict?: SaveOptionsOnConflict;
  validate?: boolean;
}

export interface RedisRepositoryModuleOptions {
  dataModuleName: string;
  schema: EntitySchema;
}

export interface RepositoryFindOptions {
  filters?: GenericObject<unknown>;
  findAll?: boolean;
  individualSearch?: boolean;
  page?: number;
  perPage?: number;
  withValues?: boolean;
}

export interface RepositoryFindPrivateOptions {
  requirePrimaryKeys?: boolean;
}

export interface SaveOptions {
  delete?: boolean;
  generatePrimaryKeys: boolean;
  onConflict?: SaveOptionsOnConflict;
  transactionId?: string;
  ttl?: number;
  validate?: boolean;
}

export enum SaveOptionsOnConflict {
  DoNothing = 'doNothing',
  ThrowError = 'throwError',
  Update = 'update'
}
