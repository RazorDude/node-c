import { Global, Module } from '@nestjs/common';

import { Constants as NodeCCoreConstants, loadDynamicModules } from '@node-c/core';

import * as FolderData from './services';

import { Constants } from '../../common/definitions';

const { services } = loadDynamicModules(FolderData);

/**
 * This module is used to test authentication and authorization where authentication is federated with the
 * IAM domain module, whereas authorization is performed locally.
 */
@Global()
@Module({
  providers: [
    {
      provide: NodeCCoreConstants.DOMAIN_MODULE_NAME,
      useValue: Constants.DOMAIN_COURSE_PLATFORM_FEDERATED_MODULE_NAME
    },
    ...services!
  ],
  exports: [...services!]
})
export class DomainCoursePlatformFederatedModule {}
