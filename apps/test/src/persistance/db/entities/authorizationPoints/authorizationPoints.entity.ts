import { GenericObject } from '@node-c/core';

import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface AuthorizationPoint<UserType extends DBEntity = DBEntity> extends DBEntity {
  allowedInputData?: GenericObject;
  controllerNames?: string[];
  forbiddenInputData?: GenericObject;
  handlerNames?: string[];
  inputDataFieldName?: string;
  moduleNames?: string[];
  name: string;
  requiredStaticData?: GenericObject;
  userFieldName?: string;
  userTypes?: UserType[];
}

export const AuthorizationPointEntity = new EntitySchema<AuthorizationPoint>({
  columns: {
    ...DBEntitySchema.columns,
    allowedInputData: { type: 'json', nullable: true },
    controllerNames: { type: 'json', nullable: true },
    forbiddenInputData: { type: 'json', nullable: true },
    handlerNames: { type: 'json', nullable: true },
    inputDataFieldName: { type: 'varchar', nullable: true },
    moduleNames: { type: 'json', nullable: true },
    name: { type: 'varchar', unique: true },
    requiredStaticData: { type: 'json', nullable: true },
    userFieldName: { type: 'varchar', nullable: true }
  },
  name: 'authorizationPoint',
  relations: {
    userTypes: {
      type: 'many-to-many',
      target: 'userType',
      inverseSide: 'authorizationPoints'
    }
  },
  tableName: 'authorizationPoints'
  // indices with "where", unfortunately, don't work in mysql
  // indices: [
  //   {
  //     spatial: true,
  //     columns: [ '"inputDataFieldName"', '"userFieldName"' ],
  //     where: '("inputDataFieldName" is not null) or ("userFieldName" is not null)'
  //   },
  //   {
  //     spatial: true,
  //     columns: [ '"controllerNames"', '"moduleNames"' ],
  //     where: '"handlerNames" is not null'
  //   },
  //   {
  //     spatial: true,
  //     columns: [ '"moduleNames"' ],
  //     where: '"controllerNames" is not null'
  //   }
  // ],
});
