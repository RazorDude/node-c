import { type DynamicModule, Module } from '@nestjs/common';

import { DomainIAMModule as BaseDomainIAMModule } from '@node-c/domain-iam';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './services/iam.services.js';

@Module({})
export class DomainIAMModule extends BaseDomainIAMModule {
  static register(): DynamicModule {
    return BaseDomainIAMModule.register({
      folderData: FolderData,
      moduleClass: DomainIAMModule,
      moduleName: Constants.DOMAIN_IAM_MODULE_NAME
    });
  }
}
