import { AuthorizationPoint as BaseAuthorizationPoint } from '@node-c/domain-iam';
import { EntitySchemaColumnType } from '@node-c/persistance-redis';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';

export type AuthorizationPoint = RedisEntity<string> & BaseAuthorizationPoint<string>;
export const AuthorizationPointSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'authorizationPoint')
};
