import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  type HTTPAPIModuleOptions
} from '@node-c/api-http';

import { Constants } from '../../common/definitions/common.constants.js';
import * as FolderData from './controllers/oktaMock.controllers.js';

// a mock of the Okta API, used as the Okta provider of the SSO app in the e2e tests
@Module({})
export class APIOktaMockModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: APIOktaMockModule,
    moduleName: Constants.API_OKTA_MOCK_MODULE_NAME
  };
}
