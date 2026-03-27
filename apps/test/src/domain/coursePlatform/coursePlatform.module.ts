import { Global, Module } from '@nestjs/common';

import { Constants as NodeCCoreConstants, loadDynamicModules } from '@node-c/core';

import * as FolderData from './services';

import { Constants } from '../../common/definitions';

const { services } = loadDynamicModules(FolderData);

@Global()
@Module({
  providers: [
    { provide: NodeCCoreConstants.DOMAIN_MODULE_NAME, useValue: Constants.DOMAIN_COURSE_PLATFORM_MODULE_NAME },
    ...services!
  ],
  exports: [...services!]
})
export class DomainCoursePlatformModule {}
