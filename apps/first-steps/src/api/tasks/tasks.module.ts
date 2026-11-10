import { Module } from '@nestjs/common';

import {
  HTTPAPIModule,
  type HTTPAPIModuleOptions
} from '@node-c/api-http';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './controllers/tasks.controllers.js';

@Module({})
export class APITasksModule extends HTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: APITasksModule,
    moduleName: Constants.API_TASKS_MODULE_NAME
  };
}
