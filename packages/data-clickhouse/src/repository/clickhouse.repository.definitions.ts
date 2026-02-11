import { GenericObject } from '@node-c/core';
import { RDBEntitySchema } from '@node-c/data-rdb';

export interface ClickHouseDBEntitySchema<EntityClass extends GenericObject<unknown>> extends RDBEntitySchema {
  options: {
    columns: {
      // eslint-disable-next-line no-unused-vars
      [columnName in keyof EntityClass]: ClickHouseDBEntitySchemaColumnOptions;
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
  Enum = 'ENUM',
  // eslint-disable-next-line no-unused-vars
  Integer = 'INT',
  // eslint-disable-next-line no-unused-vars
  JSON = 'JSON',
  // eslint-disable-next-line no-unused-vars
  Text = 'TEXT',
  // eslint-disable-next-line no-unused-vars
  UUID = 'UUID',
  // eslint-disable-next-line no-unused-vars
  Varchar = 'VARCHAR'
}

export interface ClickHouseDBRepositoryModuleOptions<EntityClass extends GenericObject<unknown>> {
  entitySchema: ClickHouseDBEntitySchema<EntityClass>;
  dataModuleName: string;
}
