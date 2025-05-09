import { ModuleMetadata } from '@nestjs/common';

import { GenericObject } from '@node-c/core';

export interface RedisModuleOptions {
  entityModuleRegisterOptions?: unknown;
  exports?: ModuleMetadata['exports'];
  folderData: GenericObject<unknown>;
  imports?: {
    atEnd?: ModuleMetadata['imports'];
    postStore?: ModuleMetadata['imports'];
    preStore?: ModuleMetadata['imports'];
  };
  moduleClass: unknown;
  moduleName: string;
  providers?: ModuleMetadata['providers'];
  registerOptionsPerEntityModule?: GenericObject;
}
