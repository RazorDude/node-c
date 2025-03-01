import { GenericObject } from '@node-c/core';

import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../base';

export interface GlobalConfigItem extends DBEntity {
  data: GenericObject;
  name: string;
}

export const GlobalConfigItemEntity = new EntitySchema<GlobalConfigItem>({
  columns: {
    ...DBEntitySchema.columns,
    data: { type: 'json' },
    name: { type: 'varchar', unique: true }
  },
  name: 'globalConfigItem',
  tableName: 'globalConfigItems'
});
