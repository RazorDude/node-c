import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface DataDBUserAccountStatus<User extends DBEntity = DBEntity> extends DBEntity {
  label: string;
  name: string;
  userLoginAllowed: boolean;
  users?: User[];
}

export const DataDBUserAccountStatusEntity = new EntitySchema<DataDBUserAccountStatus>({
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
    }
  },
  tableName: 'userAccountStatuses'
});
