import { TokenType as TokenTypeBase } from '@node-c/domain-iam';
import { EntitySchemaColumnType } from '@node-c/persistance-redis';

import { RedisEntity, getDefaultEntitySchema } from '../base';

export type TokenType = TokenTypeBase;

export interface CacheToken extends RedisEntity<string> {
  token: string;
  type: TokenType;
}
export const CacheTokenSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'token')
};
