import { type EntitySchema, EntitySchemaColumnType } from '@node-c/data-redis';
import type { IAMUserWithPermissionsData } from '@node-c/domain-iam';

import {
  getDefaultEntitySchema,
  type RedisEntity
} from '../../../cacheBase/entity/base.redis.entity.js';
import type { DataDBUser } from '../../../db/entities/users/users.entity.js';

const defaultSchema = getDefaultEntitySchema(
  EntitySchemaColumnType.Integer,
  'user'
);

export type DataCacheStandaloneUser = RedisEntity<number> &
  IAMUserWithPermissionsData<DataDBUser, number>;
export const DataCacheStandaloneUserSchema: EntitySchema = {
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
