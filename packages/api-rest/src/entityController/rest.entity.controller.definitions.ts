import { GenericObject } from '@node-c/core/common/definitions';
import { UpdateOptions } from '@node-c/core/persistance/entityService';

export interface UpdateBody extends UpdateOptions {
  data: GenericObject<unknown>;
  filters: GenericObject<unknown>;
}
