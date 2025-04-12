import { RDBEntitySchema } from '@node-c/persistance-rdb';

export interface ClickHouseDBEntitySchema extends RDBEntitySchema {
  options: {
    columns: {
      [columnName: string]: ClickHouseDBEntitySchemaColumnOptions;
    };
    name: string;
    paranoid?: boolean;
    tableName: string;
  };
}

export interface ClickHouseDBEntitySchemaColumnOptions {
  generated?: boolean;
  isCreationDate?: boolean;
  isDeletionDate?: boolean;
  isUpdateDate?: boolean;
  primary?: boolean;
  type?: ClickHouseDBEntitySchemaColumnType;
}

export enum ClickHouseDBEntitySchemaColumnType {
  // eslint-disable-next-line no-unused-vars
  BigInteger = 'BIGINT',
  // eslint-disable-next-line no-unused-vars
  Boolean = 'BOOL',
  // eslint-disable-next-line no-unused-vars
  DateTime = 'DATETIME',
  // eslint-disable-next-line no-unused-vars
  Integer = 'INT',
  // eslint-disable-next-line no-unused-vars
  Text = 'TEXT',
  // eslint-disable-next-line no-unused-vars
  UUID = 'UUID',
  // eslint-disable-next-line no-unused-vars
  Varchar = 'VARCHAR'
}

export interface ClickHouseDBRepositoryModuleOptions {
  entitySchema: ClickHouseDBEntitySchema;
  persistanceModuleName: string;
}
