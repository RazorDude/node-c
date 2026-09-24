import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCAPIHTTPConstants
} from '@node-c/api-http';
import { Constants as NodeCDomainIAMConstants } from '@node-c/domain-iam';

import * as FolderData from './controllers/coursePlatformStandalone.controllers.js';

import { Constants } from '../../common/definitions/common.constants.js';
import { DomainCoursePlatformStandaloneAuthenticationManagerService } from '../../domain/coursePlatformStandalone/services/authenticationManager/authenticationManager.service.js';
import { DomainCoursePlatformStandaloneAuthorizationService } from '../../domain/coursePlatformStandalone/services/authorization/authorization.service.js';
import { DomainCoursePlatformStandaloneTokenManagerService } from '../../domain/coursePlatformStandalone/services/tokenManager/tokenManager.service.js';

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
      },
      {
        provide: NodeCAPIHTTPConstants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE,
        useExisting: DomainCoursePlatformStandaloneTokenManagerService
      }
    ]
  };
}
