import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface CourseType<Course extends DBEntity = DBEntity> extends DBEntity {
  courses?: Course[];
  isActive: boolean;
  name: string;
}

export const CourseTypeEntity = new EntitySchema<CourseType<DBEntity>>({
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
