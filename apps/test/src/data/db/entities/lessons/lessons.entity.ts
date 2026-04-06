import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { DataDBCourse } from '../courses';
import { DataDBLessonType } from '../lessonTypes';

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
