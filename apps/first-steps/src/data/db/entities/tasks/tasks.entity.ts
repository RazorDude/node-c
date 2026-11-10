import { EntitySchema } from 'typeorm';

import {
  type DBEntity,
  DBEntitySchema
} from '../../../dbBase/entity/base.db.entity.js';

export interface DataDBTask extends DBEntity {
  done: boolean;
  title: string;
}

export const DataDBTaskEntity = new EntitySchema<DataDBTask>({
  columns: {
    ...DBEntitySchema.columns,
    done: { type: 'boolean', default: false },
    title: { type: 'varchar' }
  },
  name: 'task',
  tableName: 'tasks'
});
