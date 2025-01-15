import { DynamicModule, Module } from '@nestjs/common';

import { DomainIAMModuleOptions } from './iam.definitions';

import { Constants } from '../../common/definitions';
import { loadDynamicModules } from '../../common/utils';

@Module({})
export class DomainIAMModule {
  static register(options: DomainIAMModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports } = options;
    const { atEnd: importsAtEnd, atStart: importsAtStart } = additionalImports || {};
    const { modules, services } = loadDynamicModules(folderData);
    return {
      module: DomainIAMModule,
      imports: [...(importsAtStart || []), ...(modules || []), ...(importsAtEnd || [])],
      providers: [
        {
          provide: Constants.DOMAIN_MODULE_NAME,
          useValue: options.moduleName
        },
        ...(services || []),
        ...(options.providers || [])
      ],
      exports: [...(services || []), ...(options.exports || [])]
    };
  }
}
