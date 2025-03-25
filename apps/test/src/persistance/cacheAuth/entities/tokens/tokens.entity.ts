import { TokenType as TokenTypeBase } from '@node-c/domain-iam';
import { EntitySchema, EntitySchemaColumnType } from '@node-c/persistance-redis';

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
    ...baseSchema.columns,
    refreshToken: {
      type: EntitySchemaColumnType.String
    },
    token: {
      type: EntitySchemaColumnType.String
    },
    type: {
      type: EntitySchemaColumnType.String
    },
    userId: {
      type: EntitySchemaColumnType.String
    }
  }
};
