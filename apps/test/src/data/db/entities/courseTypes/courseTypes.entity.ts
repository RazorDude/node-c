import ld from 'lodash';
import { EntitySchema } from 'typeorm';

import {
  type DBEntity,
  DBEntitySchema
} from '../../../dbBase/entity/base.db.entity.js';

export interface DataDBCourseType<Course extends DBEntity = DBEntity>
  extends DBEntity {
  courses?: Course[];
  isActive: boolean;
  name: string;
}

export const DataDBCourseTypeEntity = new EntitySchema<
  DataDBCourseType<DBEntity>
>({
  columns: {
    ...ld.omit(DBEntitySchema.columns, ['deletedAt']),
    isActive: { type: 'boolean', default: true },
    name: { name: 'course_type_name', type: 'varchar', unique: true },
    deletedAt: {
      deleteDate: true,
      name: 'deleted_at',
      type: 'datetime'
    }
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
