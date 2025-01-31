import { ModuleMetadata } from '@nestjs/common';

import { GenericObject } from '../../../common/definitions';

export interface HTTPAPIModuleOptions {
  controllers?: ModuleMetadata['controllers'];
  exports?: ModuleMetadata['exports'];
  folderData: GenericObject<unknown>;
  imports?: {
    atEnd?: ModuleMetadata['imports'];
    atStart?: ModuleMetadata['imports'];
  };
  moduleClass: unknown;
  moduleName: string;
  providers?: ModuleMetadata['providers'];
}
