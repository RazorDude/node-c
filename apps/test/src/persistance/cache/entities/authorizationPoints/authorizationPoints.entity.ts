import { AuthorizationPoint as BaseAuthorizationPoint } from '@node-c/domain-iam';
import { EntitySchemaColumnType } from '@node-c/persistance-redis';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase';
import { AuthorizationPoint as DBAuthorizationPoint, UserType } from '../../../db';

const defaultSchema = getDefaultEntitySchema(EntitySchemaColumnType.Integer, 'authorizationPoint');

export type AuthorizationPoint = RedisEntity<number> &
  BaseAuthorizationPoint<number> &
  Omit<DBAuthorizationPoint, 'userTypes'> & { userTypes: UserType[] };
export const AuthorizationPointSchema = {
  columns: {
    ...defaultSchema.columns
    // allowedInputData?: GenericObject;
    // controllerNames?: string[];
    // forbiddenInputData?: GenericObject;
    // handlerNames?: string[];
    // inputDataFieldName?: string;
    // moduleNames?: string[];
    // name: string;
    // requiredStaticData?: GenericObject;
    // userFieldName?: string;
    // userTypes?: UserType[];
    // createdAt: {
    //   isCreationDate: true,
    //   type: EntitySchemaColumnType.TimestampTz
    // }
  },
  name: defaultSchema.name
};
