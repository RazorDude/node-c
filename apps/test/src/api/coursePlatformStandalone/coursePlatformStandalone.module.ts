import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCAPIHTTPConstants
} from '@node-c/api-http';
import { Constants as NodeCDomainIAMConstants } from '@node-c/domain-iam';

import * as FolderData from './controllers';

import { Constants } from '../../common/definitions';
import {
  DomainCoursePlatformStandaloneAuthenticationManagerService,
  DomainCoursePlatformStandaloneAuthorizationService
} from '../../domain/coursePlatformStandalone';

@Module({})
export class APICoursePlatformStandaloneModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: APICoursePlatformStandaloneModule,
    moduleName: Constants.API_COURSE_PLATFORM_STANDALONE_MODULE_NAME,
    providers: [
      {
        provide: NodeCDomainIAMConstants.ACCESS_CONTROL_MODULE_NAME,
        useValue: Constants.API_COURSE_PLATFORM_MODULE_NAME
      },
      {
        provide: NodeCAPIHTTPConstants.API_MODULE_AUTHORIZATION_SERVICE,
        useExisting: DomainCoursePlatformStandaloneAuthorizationService
      },
      {
        provide: NodeCAPIHTTPConstants.AUTHORIZATION_MIDDLEWARE_AUTHENTICATION_MANAGER_SERVICE,
        useExisting: DomainCoursePlatformStandaloneAuthenticationManagerService
      }
    ]
  };
}
