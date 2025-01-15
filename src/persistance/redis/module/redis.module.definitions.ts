import { ModuleMetadata } from '@nestjs/common';

import { GenericObject } from '../../../common/definitions';

export interface RedisModuleOptions {
  exports?: ModuleMetadata['exports'];
  folderData: GenericObject<unknown>;
  imports?: {
    atEnd?: ModuleMetadata['imports'];
    postStore?: ModuleMetadata['imports'];
    preStore?: ModuleMetadata['imports'];
  };
  moduleName: string;
  providers?: ModuleMetadata['providers'];
  storeKey: string;
}
