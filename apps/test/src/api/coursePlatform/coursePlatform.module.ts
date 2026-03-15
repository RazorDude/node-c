import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCAPIHTTPConstants
} from '@node-c/api-http';
import { Constants as NodeCDomainIAMConstants } from '@node-c/domain-iam';

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
        provide: NodeCDomainIAMConstants.ACCESS_CONTROL_MODULE_NAME,
        useValue: Constants.API_COURSE_PLATFORM_MODULE_NAME
      },
      {
        provide: NodeCAPIHTTPConstants.API_MODULE_AUTHORIZATION_SERVICE,
        useExisting: IAMAuthorizationService
      }
    ]
  };
}
