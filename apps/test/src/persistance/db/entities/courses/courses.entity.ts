import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { Category } from '../categories';
import { CourseType } from '../courseTypes';

export interface Course<Lesson extends DBEntity = DBEntity, User extends DBEntity = DBEntity> extends DBEntity {
  category?: Category;
  categoryId?: number;
  courseType?: CourseType;
  courseTypeId: number;
  lessons?: Lesson[];
  name: string;
  users?: User[];
}

export const CourseEntity = new EntitySchema<Course>({
  columns: {
    ...DBEntitySchema.columns,
    categoryId: { name: 'category_id', nullable: true, type: 'integer' },
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
    category: {
      type: 'many-to-one',
      target: 'category',
      inverseSide: 'courses',
      joinColumn: { name: 'category_id', referencedColumnName: 'id' }
    },
    courseType: {
      type: 'many-to-one',
      target: 'courseType',
      inverseSide: 'courses'
    },
    lessons: {
      type: 'many-to-many',
      target: 'lesson',
      inverseSide: 'courses',
      joinTable: {
        name: 'courseLessons',
        joinColumn: { name: 'courseId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'lessonId', referencedColumnName: 'id' }
      }
    },
    users: {
      type: 'many-to-many',
      target: 'user',
      inverseSide: 'assignedCourses',
      joinTable: {
        name: 'userAssignedCourses',
        joinColumn: { name: 'courseId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
      }
    }
  },
  tableName: 'courses',
  name: 'course'
});
