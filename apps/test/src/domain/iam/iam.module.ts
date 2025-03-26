import { DynamicModule, Module } from '@nestjs/common';

import { DomainIAMModule as BaseDomainIAMModule } from '@node-c/domain-iam';

import * as FolderData from './services';

import { Constants } from '../../common/definitions';

@Module({})
export class DomainIAMModule extends BaseDomainIAMModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: DomainIAMModule,
      moduleName: Constants.DOMAIN_IAM_MODULE_NAME
    });
  }
}
