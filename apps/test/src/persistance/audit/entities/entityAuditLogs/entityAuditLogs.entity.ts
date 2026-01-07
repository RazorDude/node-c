import { GenericObject } from '@node-c/core';
import { ClickHouseDBEntitySchema, ClickHouseDBEntitySchemaColumnType } from '@node-c/persistance-clickhouse';

export interface EntityAuditLog extends GenericObject {
  dataBefore?: GenericObject;
  dataAfter: GenericObject;
  datetime: string;
  entityName: string;
  entityPrimaryKeyValue: string;
  entityPrimaryKeysAdditionalData?: GenericObject;
  userId: number;
}

export const EntityAuditLogEntity: ClickHouseDBEntitySchema<EntityAuditLog> = {
  options: {
    columns: {
      dataBefore: { type: ClickHouseDBEntitySchemaColumnType.JSON },
      dataAfter: { type: ClickHouseDBEntitySchemaColumnType.JSON },
      datetime: { type: ClickHouseDBEntitySchemaColumnType.DateTime },
      entityName: { type: ClickHouseDBEntitySchemaColumnType.Varchar },
      entityPrimaryKeyValue: { type: ClickHouseDBEntitySchemaColumnType.Varchar },
      entityPrimaryKeysAdditionalData: { type: ClickHouseDBEntitySchemaColumnType.JSON },
      userId: { type: ClickHouseDBEntitySchemaColumnType.BigInteger }
    },
    tableName: 'entityAuditLogs',
    name: 'entityAuditLog'
  }
};
