import { GenericObject } from '@node-c/core';

import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface DataDBPermission<Role extends DBEntity = DBEntity> extends DBEntity {
  allowedInputData?: GenericObject;
  allowedOutputData?: GenericObject;
  forbiddenInputData?: GenericObject;
  forbiddenOutputData?: GenericObject;
  inputDataFieldName?: string;
  moduleName: string;
  name: string;
  requiredStaticData?: GenericObject;
  resourceContext?: string;
  resources?: string[];
  roles?: Role[];
  userFieldName?: string;
}

export const DataDBPermissionEntity = new EntitySchema<DataDBPermission>({
  columns: {
    ...DBEntitySchema.columns,
    allowedInputData: { type: 'json', nullable: true },
    allowedOutputData: { type: 'json', nullable: true },
    forbiddenInputData: { type: 'json', nullable: true },
    forbiddenOutputData: { type: 'json', nullable: true },
    inputDataFieldName: { type: 'varchar', nullable: true },
    moduleName: { type: 'varchar', nullable: true },
    name: { type: 'varchar', unique: true },
    resourceContext: { type: 'varchar', nullable: true },
    resources: { type: 'json', nullable: true },
    requiredStaticData: { type: 'json', nullable: true },
    userFieldName: { type: 'varchar', nullable: true }
  },
  name: 'permission',
  relations: {
    roles: {
      type: 'many-to-many',
      target: 'role',
      inverseSide: 'permissions'
    }
  },
  tableName: 'permissions'
  // indices with "where", unfortunately, don't work in mysql
  // indices: [
  //   {
  //     spatial: true,
  //     columns: [ '"inputDataFieldName"', '"userFieldName"' ],
  //     where: '("inputDataFieldName" is not null) or ("userFieldName" is not null)'
  //   },
  //   {
  //     spatial: true,
  //     columns: [ '"resourceContext"', '"moduleNames"' ],
  //     where: '"resources" is not null'
  //   },
  //   {
  //     spatial: true,
  //     columns: [ '"moduleNames"' ],
  //     where: '"resourceContext" is not null'
  //   }
  // ],
});
