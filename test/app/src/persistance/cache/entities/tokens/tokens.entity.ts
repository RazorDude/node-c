import { EntitySchemaColumnType, RedisEntity, getDefaultEntitySchema } from '@node-c/persistance/redis';

export type CacheToken = RedisEntity<string>;
export const cacheTokenSchema = getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'token');
