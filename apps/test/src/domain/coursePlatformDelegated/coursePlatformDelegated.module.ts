import { Global, Module } from '@nestjs/common';

import {
  loadDynamicModules,
  Constants as NodeCCoreConstants
} from '@node-c/core';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './services/coursePlatformDelegated.services.js';

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
