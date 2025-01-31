import { GenericObject } from '../../../common/definitions';
import { UpdateOptions } from '../../../persistance/common/entityService';

export interface UpdateBody extends UpdateOptions {
  data: GenericObject<unknown>;
  filters: GenericObject<unknown>;
}
