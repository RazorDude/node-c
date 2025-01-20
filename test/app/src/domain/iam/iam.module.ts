import { Module } from '@nestjs/common';

import { DomainIAMModule as BaseDomainIAMModule, DomainIAMModuleOptions } from '@node-c/domain/iam';

import * as FolderData from './services';

import { Constants } from '../../common/definitions';

@Module({})
export class DomainIAMModule extends BaseDomainIAMModule {
  static readonly moduleOptions: DomainIAMModuleOptions = {
    folderData: FolderData,
    moduleClass: DomainIAMModule,
    moduleName: Constants.DOMAIN_IAM_MODULE_NAME
  };
}
