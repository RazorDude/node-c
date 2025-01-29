import { User } from '@node-c/domain/iam';
import { EntitySchemaColumnType, RedisEntity, getDefaultEntitySchema } from '@node-c/persistance/redis';

export type CacheUser = RedisEntity<string> & User<string, string>;
export const CacheUserSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'id')
};
