import { DomainUpdateOptions, GenericObject } from '@node-c/core';

export interface UpdateBody extends DomainUpdateOptions {
  data: GenericObject<unknown>;
  filters: GenericObject<unknown>;
}
