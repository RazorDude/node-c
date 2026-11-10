import { Global, Module } from '@nestjs/common';

import {
  loadDynamicModules,
  Constants as NodeCCoreConstants
} from '@node-c/core';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './services/tasks.services.js';

const { services } = loadDynamicModules(FolderData);

@Global()
@Module({
  providers: [
    {
      provide: NodeCCoreConstants.DOMAIN_MODULE_NAME,
      useValue: Constants.DOMAIN_TASKS_MODULE_NAME
    },
    ...services!
  ],
  exports: [...services!]
})
export class DomainTasksModule {}
