import { GenericObject } from '../../../common/definitions';

export interface EntitySchema {
  columns: {
    [columnName: string]: {
      generated?: boolean;
      primary?: boolean;
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
  UUIDV4 = 'uuidv4'
}

export interface FindOptions {
  exactSearch?: boolean;
  filters?: GenericObject<unknown>;
  findAll?: boolean;
  page?: number;
  perPage?: number;
  withValues?: boolean;
}

export interface PrepareOptions {
  generatePrimaryKeys?: boolean;
  onConflict?: SaveOptionsOnConflict;
  validate?: boolean;
}

export interface RedisRepositoryModuleOptions {
  schema: EntitySchema;
}

export interface SaveOptions {
  delete?: boolean;
  onConflict?: SaveOptionsOnConflict;
  transactionId?: string;
}

export enum SaveOptionsOnConflict {
  // eslint-disable-next-line no-unused-vars
  DoNothing = 'doNothing',
  // eslint-disable-next-line no-unused-vars
  ThrowError = 'throwError',
  // eslint-disable-next-line no-unused-vars
  Update = 'update'
}