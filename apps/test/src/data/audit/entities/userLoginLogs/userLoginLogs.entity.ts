import { GenericObject } from '@node-c/core';
import { ClickHouseDBEntitySchema, ClickHouseDBEntitySchemaColumnType } from '@node-c/data-clickhouse';

export interface DataAuditUserLoginLog extends GenericObject {
  datetime: string;
  userId: number;
}

export const DataAuditUserLoginLogEntity: ClickHouseDBEntitySchema<DataAuditUserLoginLog> = {
  options: {
    columns: {
      datetime: { type: ClickHouseDBEntitySchemaColumnType.DateTime },
      userId: { type: ClickHouseDBEntitySchemaColumnType.BigInteger }
    },
    tableName: 'userLoginLogs',
    name: 'userLoginLog'
  }
};
