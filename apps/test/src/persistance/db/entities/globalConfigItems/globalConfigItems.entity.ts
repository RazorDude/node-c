import { GenericObject } from '@node-c/core';
import { RDBEntity, RDBEntitySchema } from '@node-c/persistance-rdb';

import { EntitySchema } from 'typeorm';

export interface GlobalConfigItem extends RDBEntity {
  data: GenericObject;
  name: string;
}

export const GlobalConfigItemEntity = new EntitySchema<GlobalConfigItem>({
  columns: {
    ...RDBEntitySchema.columns,
    data: { type: 'json' },
    name: { type: 'varchar', unique: true }
  },
  name: 'globalConfigItem',
  tableName: 'globalConfigItems'
});
