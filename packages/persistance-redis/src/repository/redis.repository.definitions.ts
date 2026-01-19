import { GenericObject } from '@node-c/core';

import { ValidationSchema } from 'class-validator';

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
  // eslint-disable-next-line no-unused-vars
  Array = 'array',
  // eslint-disable-next-line no-unused-vars
  Boolean = 'boolean',
  // eslint-disable-next-line no-unused-vars
  Integer = 'integer',
  // eslint-disable-next-line no-unused-vars
  Object = 'object',
  // eslint-disable-next-line no-unused-vars
  String = 'string',
  // eslint-disable-next-line no-unused-vars
  TimestampTz = 'timestampTz',
  // eslint-disable-next-line no-unused-vars
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
  persistanceModuleName: string;
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
  // eslint-disable-next-line no-unused-vars
  DoNothing = 'doNothing',
  // eslint-disable-next-line no-unused-vars
  ThrowError = 'throwError',
  // eslint-disable-next-line no-unused-vars
  Update = 'update'
}
