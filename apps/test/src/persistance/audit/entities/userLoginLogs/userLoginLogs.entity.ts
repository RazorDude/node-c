import { GenericObject } from '@node-c/core';
import { ClickHouseDBEntitySchema, ClickHouseDBEntitySchemaColumnType } from '@node-c/persistance-clickhouse';

export interface UserLoginLog extends GenericObject {
  datetime: string;
  userId: number;
}

export const UserLoginLogEntity: ClickHouseDBEntitySchema = {
  options: {
    columns: {
      datetime: { type: ClickHouseDBEntitySchemaColumnType.DateTime },
      userId: { type: ClickHouseDBEntitySchemaColumnType.BigInteger }
    },
    tableName: 'userLoginLogs',
    name: 'userLoginLog'
  }
};
