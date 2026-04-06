import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCAPIHTTPConstants
} from '@node-c/api-http';
import { Constants as NodeCDomainIAMConstants } from '@node-c/domain-iam';

import * as FolderData from './controllers';

import { Constants } from '../../common/definitions';
import { DomainIAMAuthenticationManagerService, DomainIAMAuthorizationService } from '../../domain/iam';

@Module({})
export class APICoursePlatformDelegatedModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: APICoursePlatformDelegatedModule,
    moduleName: Constants.API_COURSE_PLATFORM_DELEGATED_MODULE_NAME,
    providers: [
      {
        provide: NodeCDomainIAMConstants.ACCESS_CONTROL_MODULE_NAME,
        useValue: Constants.API_COURSE_PLATFORM_MODULE_NAME
      },
      {
        provide: NodeCAPIHTTPConstants.API_MODULE_AUTHORIZATION_SERVICE,
        useExisting: DomainIAMAuthorizationService
      },
      {
        provide: NodeCAPIHTTPConstants.AUTHORIZATION_MIDDLEWARE_AUTHENTICATION_MANAGER_SERVICE,
        useExisting: DomainIAMAuthenticationManagerService
      }
    ]
  };
}
