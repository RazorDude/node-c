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
  DomainCoursePlatformFederatedAuthenticationManagerService,
  DomainCoursePlatformFederatedAuthorizationService,
  DomainCoursePlatformFederatedTokenManagerService
} from '../../domain/coursePlatformFederated';

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
