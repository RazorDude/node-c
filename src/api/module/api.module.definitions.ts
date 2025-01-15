import { ModuleMetadata } from '@nestjs/common';

import { GenericObject } from '../../common/definitions';

export interface APIModuleOptions {
  exports?: ModuleMetadata['exports'];
  folderData: GenericObject<unknown>;
  imports?: {
    atEnd?: ModuleMetadata['imports'];
    atStart?: ModuleMetadata['imports'];
  };
  moduleName: string;
  providers?: ModuleMetadata['providers'];
}
