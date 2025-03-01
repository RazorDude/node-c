import { TokenType as TokenTypeBase } from '@node-c/domain-iam';
import { EntitySchemaColumnType } from '@node-c/persistance-redis';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';

export type TokenType = TokenTypeBase;

export interface CacheAuthToken extends RedisEntity<string> {
  token: string;
  type: TokenType;
}
export const CacheAuthTokenSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'token')
};
