import { EntitySchema } from 'typeorm';

export interface DataOktaMockUser {
  email: string;
  id: number;
  name: string;
}

export const DataOktaMockUserEntity = new EntitySchema<DataOktaMockUser>({
  columns: {
    email: { type: 'varchar', unique: true },
    id: { generated: 'increment', primary: true, type: 'integer' },
    name: { type: 'varchar' }
  },
  name: 'user',
  tableName: 'users'
});
