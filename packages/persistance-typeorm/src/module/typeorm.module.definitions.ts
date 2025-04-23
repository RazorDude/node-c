import { ModuleMetadata } from '@nestjs/common';

import { GenericObject } from '@node-c/core';

export interface TypeORMDBModuleOptions {
  connectionName: string;
  entityModuleRegisterOptions?: unknown;
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
  registerOptionsPerEntityModule?: GenericObject;
}
