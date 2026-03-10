import { GenericObject } from '@node-c/core';
import { EntitySchema, EntitySchemaColumnType } from '@node-c/data-redis';

import ld from 'lodash';

import { getDefaultEntitySchema } from '../../../cacheBase';

export interface CacheAuthUserStepDataItem extends GenericObject<unknown> {
  codeVerifier: string;
  state: string;
}

const baseSchema = getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'userStepDataItem');
export const CacheAuthUserStepDataItemSchema: EntitySchema = {
  ...ld.omit(baseSchema, 'columns'),
  columns: {
    codeVerifier: {
      type: EntitySchemaColumnType.String
    },
    state: {
      generated: false,
      primary: true,
      primaryOrder: 0,
      type: EntitySchemaColumnType.String
    }
  }
};
