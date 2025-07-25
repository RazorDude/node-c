import { GenericObject } from '@node-c/core';

export interface EntitySchema {
  columns: {
    [columnName: string]: {
      generated?: boolean;
      isCreationDate?: boolean;
      isDeletionDate?: boolean;
      isUpdateDate?: boolean;
      primary?: boolean;
      primaryOrder?: number;
      type?: EntitySchemaColumnType;
    };
  };
  name: string;
  paranoid?: boolean;
}

export enum EntitySchemaColumnType {
  // eslint-disable-next-line no-unused-vars
  Integer = 'integer',
  // eslint-disable-next-line no-unused-vars
  String = 'string',
  // eslint-disable-next-line no-unused-vars
  TimestampTz = 'timestampTz',
  // eslint-disable-next-line no-unused-vars
  UUIDV4 = 'uuidv4'
}

export interface PrepareOptions {
  generatePrimaryKeys?: boolean;
  onConflict?: SaveOptionsOnConflict;
  validate?: boolean;
}

export interface RedisRepositoryModuleOptions {
  persistanceModuleName: string;
  schema: EntitySchema;
}

export interface RepositoryFindOptions {
  exactSearch?: boolean;
  filters?: GenericObject<unknown>;
  findAll?: boolean;
  page?: number;
  perPage?: number;
  withValues?: boolean;
}

export interface SaveOptions {
  delete?: boolean;
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
