import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface UserAccountStatus<User extends DBEntity = DBEntity> extends DBEntity {
  label: string;
  name: string;
  userLoginAllowed: boolean;
  users?: User[];
}

export const UserAccountStatusEntity = new EntitySchema<UserAccountStatus>({
  columns: {
    ...DBEntitySchema.columns,
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
