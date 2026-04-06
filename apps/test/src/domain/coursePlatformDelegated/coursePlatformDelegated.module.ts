import { Global, Module } from '@nestjs/common';

import { Constants as NodeCCoreConstants, loadDynamicModules } from '@node-c/core';

import * as FolderData from './services';

import { Constants } from '../../common/definitions';

const { services } = loadDynamicModules(FolderData);

/**
 * This module is used to test authentication and authorization where everything is delegated
 * to the IAM domain module.
 */
@Global()
@Module({
  providers: [
    {
      provide: NodeCCoreConstants.DOMAIN_MODULE_NAME,
      useValue: Constants.DOMAIN_COURSE_PLATFORM_DELEGATED_MODULE_NAME
    },
    ...services!
  ],
  exports: [...services!]
})
export class DomainCoursePlatformDelegatedModule {}
