import { ModuleMetadata } from '@nestjs/common';

import { GenericObject } from '../../../common/definitions';

export interface RDBModuleOptions {
  connectionName: string;
  exports?: ModuleMetadata['exports'];
  folderData: GenericObject<unknown>;
  imports?: {
    atEnd?: ModuleMetadata['imports'];
    postORM?: ModuleMetadata['imports'];
    preORM?: ModuleMetadata['imports'];
  };
  moduleName: string;
  providers?: ModuleMetadata['providers'];
}
