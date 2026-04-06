import { EntitySchema, EntitySchemaColumnType } from '@node-c/data-redis';
import { IAMPermission } from '@node-c/domain-iam';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';
import { DataDBPermission, DataDBRole } from '../../../db';

const defaultSchema = getDefaultEntitySchema(EntitySchemaColumnType.Integer, 'permission');

export type DataCachePermission = RedisEntity<number> &
  IAMPermission<number> &
  Omit<DataDBPermission, 'roles'> & { roles: DataDBRole[] };
export const DataCachePermissionSchema: EntitySchema = {
  ...defaultSchema,
  columns: {
    ...defaultSchema.columns,
    allowedInputData: {
      type: EntitySchemaColumnType.Object
    },
    allowedOutputData: {
      type: EntitySchemaColumnType.Object
    },
    controllerNames: {
      type: EntitySchemaColumnType.Array
    },
    forbiddenInputData: {
      type: EntitySchemaColumnType.Object
    },
    forbiddenOutputData: {
      type: EntitySchemaColumnType.Object
    },
    handlerNames: {
      type: EntitySchemaColumnType.Array
    },
    inputDataFieldName: {
      type: EntitySchemaColumnType.String
    },
    moduleNames: {
      type: EntitySchemaColumnType.Array
    },
    name: {
      type: EntitySchemaColumnType.String
    },
    requiredStaticData: {
      type: EntitySchemaColumnType.Object
    },
    userFieldName: {
      type: EntitySchemaColumnType.String
    },
    roles: {
      type: EntitySchemaColumnType.Array
    }
  }
};
