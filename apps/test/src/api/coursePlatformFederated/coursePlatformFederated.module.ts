import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCAPIHTTPConstants
} from '@node-c/api-http';
import { Constants as NodeCDomainIAMConstants } from '@node-c/domain-iam';

import * as FolderData from './controllers/coursePlatformFederated.controllers.js';

import { Constants } from '../../common/definitions/common.constants.js';
import { DomainCoursePlatformFederatedAuthenticationManagerService } from '../../domain/coursePlatformFederated/services/authenticationManager/authenticationManager.service.js';
import { DomainCoursePlatformFederatedAuthorizationService } from '../../domain/coursePlatformFederated/services/authorization/authorization.service.js';
import { DomainCoursePlatformFederatedTokenManagerService } from '../../domain/coursePlatformFederated/services/tokenManager/tokenManager.service.js';

@Module({})
export class APICoursePlatformFederatedModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: APICoursePlatformFederatedModule,
    moduleName: Constants.API_COURSE_PLATFORM_FEDERATED_MODULE_NAME,
    providers: [
      {
        provide: NodeCDomainIAMConstants.ACCESS_CONTROL_MODULE_NAME,
        useValue: Constants.API_COURSE_PLATFORM_MODULE_NAME
      },
      {
        provide: NodeCAPIHTTPConstants.API_MODULE_AUTHORIZATION_SERVICE,
        useExisting: DomainCoursePlatformFederatedAuthorizationService
      },
      {
        provide: NodeCAPIHTTPConstants.AUTHORIZATION_MIDDLEWARE_AUTHENTICATION_MANAGER_SERVICE,
        useExisting: DomainCoursePlatformFederatedAuthenticationManagerService
      },
      {
        provide: NodeCAPIHTTPConstants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE,
        useExisting: DomainCoursePlatformFederatedTokenManagerService
      }
    ]
  };
}
