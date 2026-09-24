import { EntitySchema, EntitySchemaColumnType } from '@node-c/data-redis';

import { RedisEntity, getDefaultEntitySchema } from '../../../cacheBase/entity/base.redis.entity.js';
import { DataDBCourse } from '../../../db/entities/db.entities.js';

const defaultSchema = getDefaultEntitySchema(EntitySchemaColumnType.Integer, 'course');

export type DataCacheCourse = RedisEntity<number> & DataDBCourse;
export const DataCacheCourseSchema: EntitySchema = {
  ...defaultSchema,
  columns: {
    ...defaultSchema.columns,
    name: {
      type: EntitySchemaColumnType.String
    }
  }
};
