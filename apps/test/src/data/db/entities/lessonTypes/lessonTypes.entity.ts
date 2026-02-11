import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface LessonType<Lesson extends DBEntity = DBEntity> extends DBEntity {
  isActive: boolean;
  lessons?: Lesson[];
  name: string;
}

export const LessonTypeEntity = new EntitySchema<LessonType<DBEntity>>({
  columns: {
    ...DBEntitySchema.columns,
    isActive: { type: 'boolean', default: true },
    name: { type: 'varchar', unique: true }
  },
  name: 'lessonType',
  relations: {
    lessons: {
      type: 'one-to-many',
      target: 'lesson',
      inverseSide: 'lessonType'
    } as EntitySchemaRelationOptions
  },
  tableName: 'lessonTypes'
});
