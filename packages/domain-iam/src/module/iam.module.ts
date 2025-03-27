import { DynamicModule } from '@nestjs/common';

import { loadDynamicModules } from '@node-c/core';

import { DomainIAMModuleOptions } from './iam.definitions';

import { Constants } from '../common/definitions';

export class DomainIAMModule {
  static register(options: DomainIAMModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass } = options;
    const { atEnd: importsAtEnd, atStart: importsAtStart } = additionalImports || {};
    const { services } = loadDynamicModules(folderData);
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [...(importsAtStart || []), ...(importsAtEnd || [])],
      providers: [
        {
          provide: Constants.DOMAIN_MODULE_NAME,
          useValue: options.moduleName
        },
        ...(options.providers || []),
        ...(services || [])
      ],
      exports: [...(services || []), ...(options.exports || [])]
    };
  }
}
