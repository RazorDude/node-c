import { GenericObject } from '@node-c/core';

import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';

export interface DataDBConfigsGlobalConfigItem extends DBEntity {
  data: GenericObject;
  name: string;
}

export const DataDBConfigsGlobalConfigItemEntity = new EntitySchema<DataDBConfigsGlobalConfigItem>({
  columns: {
    ...DBEntitySchema.columns,
    data: { type: 'json' },
    name: { type: 'varchar', unique: true }
  },
  name: 'globalConfigItem',
  tableName: 'globalConfigItems'
});
