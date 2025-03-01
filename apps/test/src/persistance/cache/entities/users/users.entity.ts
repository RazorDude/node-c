import { User } from '@node-c/domain-iam';
import { EntitySchemaColumnType } from '@node-c/persistance-redis';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';

export type CacheUser = RedisEntity<string> & User<string, string>;
export const CacheUserSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'id')
};
