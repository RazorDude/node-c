import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { Course } from '../courses';
import { LessonType } from '../lessonTypes';

export interface Lesson extends DBEntity {
  courses?: Course[];
  lessonType?: LessonType;
  lessonTypeId: number;
  name: string;
}

export const LessonEntity = new EntitySchema<Lesson>({
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
