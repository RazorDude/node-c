import { GenericObject } from '@node-c/core';
import { RDBEntitySchema } from '@node-c/data-rdb';

export interface ClickHouseDBEntitySchema<
  EntityClass extends GenericObject<unknown>
> extends RDBEntitySchema {
  options: {
    columns: {
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
  BigInteger = 'BIGINT',
  Boolean = 'BOOL',
  DateTime = 'DATETIME',
  Enum = 'ENUM',
  Integer = 'INT',
  JSON = 'JSON',
  Text = 'TEXT',
  UUID = 'UUID',
  Varchar = 'VARCHAR'
}

export interface ClickHouseDBRepositoryModuleOptions<
  EntityClass extends GenericObject<unknown>
> {
  entitySchema: ClickHouseDBEntitySchema<EntityClass>;
  dataModuleName: string;
}
