import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCConstants
} from '@node-c/api-http';

import * as FolderData from './controllers';

import { Constants } from '../../common/definitions';
import { IAMAuthorizationService } from '../../domain/iam';

@Module({})
export class CoursePlatformAPIModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: CoursePlatformAPIModule,
    moduleName: Constants.API_COURSE_PLATFORM_MODULE_NAME,
    providers: [
      {
        provide: NodeCConstants.API_MODULE_AUTHORIZATION_SERVICE,
        useExisting: IAMAuthorizationService
      }
    ]
  };
}
