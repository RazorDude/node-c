import { DynamicModule, Module } from '@nestjs/common';

// import { Constants as NodeCConstants } from '@node-c/common/definitions';
import { DomainIAMModule as BaseDomainIAMModule } from '@node-c/domain/iam';

import * as FolderData from './services';

import { Constants } from '../../common/definitions';

@Module({})
export class DomainIAMModule extends BaseDomainIAMModule {
  static register(): DynamicModule {
    return super.register({
      // exports: [
      //   {
      //     provide: NodeCConstants.AUTHENTICATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE,
      //     useClass: FolderData.IAMTokenManagerService
      //   }
      // ],
      folderData: FolderData,
      moduleClass: DomainIAMModule,
      moduleName: Constants.DOMAIN_IAM_MODULE_NAME
    });
  }
}
