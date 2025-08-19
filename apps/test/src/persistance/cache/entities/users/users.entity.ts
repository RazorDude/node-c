import { UserWithPermissionsData } from '@node-c/domain-iam';
import { EntitySchema, EntitySchemaColumnType } from '@node-c/persistance-redis';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';
import { User as DBUser } from '../../../db';

const defaultSchema = getDefaultEntitySchema(EntitySchemaColumnType.Integer, 'user');

export type CacheUser = RedisEntity<number> & UserWithPermissionsData<DBUser, number>;
export const CacheUserSchema: EntitySchema = {
  ...defaultSchema,
  columns: {
    ...defaultSchema.columns,
    accountStatus: {
      type: EntitySchemaColumnType.Object
    },
    accountStatusId: {
      type: EntitySchemaColumnType.Integer
    },
    assignedUserTypes: {
      type: EntitySchemaColumnType.Object
    },
    currentAuthorizationPoints: {
      type: EntitySchemaColumnType.Object
    },
    email: {
      type: EntitySchemaColumnType.String
    },
    firstName: {
      type: EntitySchemaColumnType.String
    },
    hasTakenIntro: {
      type: EntitySchemaColumnType.Boolean
    },
    isVerified: {
      type: EntitySchemaColumnType.Boolean
    },
    lastName: {
      type: EntitySchemaColumnType.String
    },
    mfaIsEnabled: {
      type: EntitySchemaColumnType.Boolean
    },
    password: {
      type: EntitySchemaColumnType.String
    },
    phoneNumber: {
      type: EntitySchemaColumnType.String
    },
    profileImageKey: {
      type: EntitySchemaColumnType.String
    }
  }
};
