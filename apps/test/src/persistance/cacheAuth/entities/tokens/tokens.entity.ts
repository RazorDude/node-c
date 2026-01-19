import { TokenType as TokenTypeBase } from '@node-c/domain-iam';
import { EntitySchema, EntitySchemaColumnType } from '@node-c/persistance-redis';

import ld from 'lodash';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';

export type TokenType = TokenTypeBase;

export interface CacheAuthToken extends RedisEntity<string> {
  refreshToken?: string;
  token: string;
  type: TokenType;
  userId: string;
}

const baseSchema = getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'token');
export const CacheAuthTokenSchema: EntitySchema = {
  ...baseSchema,
  columns: {
    ...ld.omit(baseSchema.columns, ['id']),
    refreshToken: {
      type: EntitySchemaColumnType.String
    },
    token: {
      type: EntitySchemaColumnType.String
    },
    type: {
      isInnerPrimary: true,
      type: EntitySchemaColumnType.String
    },
    userId: {
      primary: true,
      primaryOrder: 0,
      type: EntitySchemaColumnType.String
    }
  },
  isArray: true
};
