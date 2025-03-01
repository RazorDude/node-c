import { AccessControlPoint as BaseAccessControlPoint } from '@node-c/domain-iam';
import { EntitySchemaColumnType } from '@node-c/persistance-redis';

import { RedisEntity, getDefaultEntitySchema } from '../base';

export type AccessControlPoint = RedisEntity<string> & BaseAccessControlPoint<string>;
export const AccessControlPointSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'accessControlPoint')
};
