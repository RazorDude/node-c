import { UserWithPermissionsData } from '@node-c/domain-iam';
import { EntitySchemaColumnType } from '@node-c/persistance-redis';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';
import { User as DBUser } from '../../../db';

export type CacheUser = RedisEntity<number> & UserWithPermissionsData<DBUser, number>;
export const CacheUserSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.Integer, 'id')
};
