import { EntitySchemaColumnType, RedisEntity, getDefaultEntitySchema } from '@node-c/persistance/redis';

export enum TokenType {
  // eslint-disable-next-line no-unused-vars
  Access = 'access',
  // eslint-disable-next-line no-unused-vars
  Refresh = 'refresh'
}

export interface CacheToken extends RedisEntity<string> {
  token: string;
  type: TokenType;
}
export const CacheTokenSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'token')
};
