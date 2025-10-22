import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface Category<Course extends DBEntity = DBEntity> extends DBEntity {
  courses?: Course[];
  name: string;
}

export const CategoryEntity = new EntitySchema<Category<DBEntity>>({
  columns: {
    ...DBEntitySchema.columns,
    name: { type: 'varchar', unique: true }
  },
  name: 'category',
  relations: {
    courses: {
      type: 'one-to-many',
      target: 'course',
      inverseSide: 'category'
    }
  },
  tableName: 'category'
});
