import { TokenType as TokenTypeBase } from '@node-c/domain-iam';
import { EntitySchemaColumnType, RedisEntity, getDefaultEntitySchema } from '@node-c/persistance-redis';

export type TokenType = TokenTypeBase;

export interface CacheToken extends RedisEntity<string> {
  token: string;
  type: TokenType;
}
export const CacheTokenSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'token')
};
