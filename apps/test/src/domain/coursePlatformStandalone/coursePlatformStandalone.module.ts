import { Global, Module } from '@nestjs/common';

import {
  loadDynamicModules,
  Constants as NodeCCoreConstants
} from '@node-c/core';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './services/coursePlatformStandalone.services.js';

const { services } = loadDynamicModules(FolderData);

@Global()
@Module({
  providers: [
    {
      provide: NodeCCoreConstants.DOMAIN_MODULE_NAME,
      useValue: Constants.DOMAIN_COURSE_PLATFORM_STANDALONE_MODULE_NAME
    },
    ...services!
  ],
  exports: [...services!]
})
export class DomainCoursePlatformStandaloneModule {}
