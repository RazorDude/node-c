import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { CourseType } from '../courseTypes';

export interface Course<Lesson extends DBEntity = DBEntity, User extends DBEntity = DBEntity> extends DBEntity {
  courseType?: CourseType;
  courseTypeId: number;
  lessons?: Lesson[];
  name: string;
  users?: User[];
}

export const CourseEntity = new EntitySchema<Course>({
  columns: {
    ...DBEntitySchema.columns,
    courseTypeId: { type: 'integer' },
    name: { type: 'varchar' }
  },
  indices: [
    {
      name: 'COURSES_UNIQUE_IDX_0',
      unique: true,
      columns: ['courseTypeId', 'name'],
      where: '"deletedAt" IS NULL'
    }
  ],
  relations: {
    courseType: {
      type: 'many-to-one',
      target: 'courseType',
      inverseSide: 'courses'
    } as EntitySchemaRelationOptions,
    lessons: {
      type: 'many-to-many',
      target: 'lesson',
      inverseSide: 'courses',
      joinTable: {
        name: 'courseLessons',
        joinColumn: { name: 'courseId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'lessonId', referencedColumnName: 'id' }
      }
    } as EntitySchemaRelationOptions,
    users: {
      type: 'many-to-many',
      target: 'user',
      inverseSide: 'assignedCourses',
      joinTable: {
        name: 'userAssignedCourses',
        joinColumn: { name: 'courseId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
      }
    } as EntitySchemaRelationOptions
  },
  tableName: 'courses',
  name: 'course'
});
