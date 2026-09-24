import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCConstants
} from '@node-c/api-http';

import * as FolderData from './controllers/sso.controllers.js';

import { Constants } from '../../common/definitions/common.constants.js';
import { DomainIAMAuthenticationManagerService } from '../../domain/iam/services/authenticationManager/authenticationManager.service.js';
import { DomainIAMAuthorizationService } from '../../domain/iam/services/authorization/authorization.service.js';
import { DomainIAMTokenManagerService } from '../../domain/iam/services/tokenManager/tokenManager.service.js';

@Module({})
export class APISSOModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: APISSOModule,
    moduleName: Constants.API_SSO_MODULE_NAME,
    providers: [
      {
        provide: NodeCConstants.API_MODULE_AUTHORIZATION_SERVICE,
        useExisting: DomainIAMAuthorizationService
      },
      {
        provide: NodeCConstants.AUTHORIZATION_MIDDLEWARE_AUTHENTICATION_MANAGER_SERVICE,
        useExisting: DomainIAMAuthenticationManagerService
      },
      {
        provide: NodeCConstants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE,
        useExisting: DomainIAMTokenManagerService
      }
    ]
  };
}
