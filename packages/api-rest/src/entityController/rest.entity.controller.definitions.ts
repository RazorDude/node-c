import { GenericObject, UpdateOptions } from '@node-c/core';

export interface UpdateBody extends UpdateOptions {
  data: GenericObject<unknown>;
  filters: GenericObject<unknown>;
}
