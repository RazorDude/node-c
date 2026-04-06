import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface DataDBCourseType<Course extends DBEntity = DBEntity> extends DBEntity {
  courses?: Course[];
  isActive: boolean;
  name: string;
}

export const DataDBCourseTypeEntity = new EntitySchema<DataDBCourseType<DBEntity>>({
  columns: {
    ...DBEntitySchema.columns,
    isActive: { type: 'boolean', default: true },
    name: { type: 'varchar', unique: true }
  },
  name: 'courseType',
  relations: {
    courses: {
      type: 'one-to-many',
      target: 'course',
      inverseSide: 'courseType'
    }
  },
  tableName: 'courseTypes'
});
