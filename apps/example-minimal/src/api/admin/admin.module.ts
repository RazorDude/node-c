import { Module } from '@nestjs/common';

import { HTTPAPIModule as BaseHTTPAPIModule, HTTPAPIModuleOptions } from '@node-c/api-http';

import * as FolderData from './controllers';

import { Constants } from '../../common/definitions';

@Module({})
export class AdminAPIModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: AdminAPIModule,
    moduleName: Constants.API_ADMIN_MODULE_NAME,
    providers: []
  };
}
