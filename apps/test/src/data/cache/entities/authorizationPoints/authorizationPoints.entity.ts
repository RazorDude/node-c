import { EntitySchema, EntitySchemaColumnType } from '@node-c/data-redis';
import { AuthorizationPoint as BaseAuthorizationPoint } from '@node-c/domain-iam';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';
import { AuthorizationPoint as DBAuthorizationPoint, UserType } from '../../../db';

const defaultSchema = getDefaultEntitySchema(EntitySchemaColumnType.Integer, 'authorizationPoint');

export type AuthorizationPoint = RedisEntity<number> &
  BaseAuthorizationPoint<number> &
  Omit<DBAuthorizationPoint, 'userTypes'> & { userTypes: UserType[] };
export const AuthorizationPointSchema: EntitySchema = {
  ...defaultSchema,
  columns: {
    ...defaultSchema.columns,
    allowedInputData: {
      type: EntitySchemaColumnType.Object
    },
    controllerNames: {
      type: EntitySchemaColumnType.Array
    },
    forbiddenInputData: {
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
    userTypes: {
      type: EntitySchemaColumnType.Array
    }
  }
};
