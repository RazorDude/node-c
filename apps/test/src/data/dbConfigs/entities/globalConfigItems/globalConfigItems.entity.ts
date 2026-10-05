import type { GenericObject } from '@node-c/core';

import { EntitySchema } from 'typeorm';

import {
  type DBEntity,
  DBEntitySchema
} from '../../../dbBase/entity/base.db.entity.js';

export interface DataDBConfigsGlobalConfigItem extends DBEntity {
  data: GenericObject;
  name: string;
}

export const DataDBConfigsGlobalConfigItemEntity =
  new EntitySchema<DataDBConfigsGlobalConfigItem>({
    columns: {
      ...DBEntitySchema.columns,
      data: { type: 'json' },
      name: { type: 'varchar', unique: true }
    },
    name: 'globalConfigItem',
    tableName: 'globalConfigItems'
  });
