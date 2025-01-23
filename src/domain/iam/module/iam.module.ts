import { DynamicModule } from '@nestjs/common';

import { DomainIAMModuleOptions } from './iam.definitions';

import { Constants } from '../../../common/definitions';
import { loadDynamicModules } from '../../../common/utils';

// TODO: this shouldn't be IAM domain specific
// TODO: rework this to support EITHER modules OR services
export class DomainIAMModule {
  static register(options: DomainIAMModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass } = options;
    const { atEnd: importsAtEnd, atStart: importsAtStart } = additionalImports || {};
    const { modules, services } = loadDynamicModules(folderData);
    return {
      global: true,
      module: moduleClass as DynamicModule['module'],
      imports: [...(importsAtStart || []), ...(modules || []), ...(importsAtEnd || [])],
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
