import { ModuleMetadata } from '@nestjs/common';

import { GenericObject } from '@node-c/core';

export interface RDBModuleOptions {
  connectionName: string;
  exports?: ModuleMetadata['exports'];
  folderData: GenericObject<unknown>;
  imports?: {
    atEnd?: ModuleMetadata['imports'];
    postORM?: ModuleMetadata['imports'];
    preORM?: ModuleMetadata['imports'];
  };
  moduleClass: unknown;
  moduleName: string;
  providers?: ModuleMetadata['providers'];
}
