import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase/entity/base.db.entity.js';
import { DataDBCourse } from '../courses/courses.entity.js';
import { DataDBLessonType } from '../lessonTypes/lessonTypes.entity.js';

export interface DataDBLesson extends DBEntity {
  courses?: DataDBCourse[];
  lessonType?: DataDBLessonType;
  lessonTypeId: number;
  name: string;
}

export const DataDBLessonEntity = new EntitySchema<DataDBLesson>({
  columns: {
    ...DBEntitySchema.columns,
    lessonTypeId: { type: 'integer' },
    name: { type: 'varchar' }
  },
  relations: {
    courses: {
      type: 'many-to-many',
      target: 'course',
      inverseSide: 'lessons'
    } as EntitySchemaRelationOptions,
    lessonType: {
      type: 'many-to-one',
      target: 'lessonType',
      inverseSide: 'lessons'
    } as EntitySchemaRelationOptions
  },
  tableName: 'lessons',
  name: 'lesson'
});
