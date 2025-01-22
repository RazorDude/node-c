import { AccessControlPoint as BaseAccessControlPoint } from '@node-c/domain/iam';
import { EntitySchemaColumnType, RedisEntity, getDefaultEntitySchema } from '@node-c/persistance/redis';

export type AccessControlPoint = RedisEntity<string> & BaseAccessControlPoint<string>;
export const AccessControlPointSchema = {
  ...getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'accessControlPoint')
};
