import type { DynamicModule } from '@nestjs/common';

import { loadDynamicModules } from '@node-c/core';

import { Constants } from '../common/definitions/common.constants.js';
import type { DomainIAMModuleOptions } from './iam.definitions.js';

export class DomainIAMModule {
  static register(options: DomainIAMModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass } = options;
    const { atEnd: importsAtEnd, atStart: importsAtStart } =
      additionalImports || {};
    const { services } = loadDynamicModules(folderData);
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [...(importsAtStart || []), ...(importsAtEnd || [])],
      providers: [
        {
          provide: Constants.DOMAIN_MODULE_NAME as string,
          useValue: options.moduleName
        },
        ...(options.providers || []),
        ...(services || [])
      ],
      exports: [...(services || []), ...(options.exports || [])]
    };
  }
}
