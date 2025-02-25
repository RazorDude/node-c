import { RDBEntity, RDBEntitySchema } from '@node-c/persistance-rdb';

import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

export interface UserAccountStatus<User extends RDBEntity = RDBEntity> extends RDBEntity {
  label: string;
  name: string;
  userLoginAllowed: boolean;
  users: User[];
}

export const UserAccountStatusEntity = new EntitySchema<UserAccountStatus>({
  columns: {
    ...RDBEntitySchema.columns,
    label: { type: 'varchar', unique: true },
    name: { type: 'varchar', unique: true },
    userLoginAllowed: { type: 'boolean', default: true }
  },
  name: 'userAccountStatus',
  relations: {
    users: {
      type: 'one-to-many',
      target: 'user',
      inverseSide: 'accountStatus'
    } as EntitySchemaRelationOptions
  },
  tableName: 'userAccountStatuses'
});
