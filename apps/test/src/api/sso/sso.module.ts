import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCConstants
} from '@node-c/api-http';

import { AuthorizationData } from '@node-c/domain-iam';

import * as FolderData from './controllers';

import { Constants } from '../../common/definitions';
import { IAMAuthorizationService } from '../../domain/iam';

@Module({})
export class SSOAPIModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: SSOAPIModule,
    moduleName: Constants.API_SSO_MODULE_NAME,
    providers: [
      {
        provide: NodeCConstants.API_MODULE_ACP,
        useFactory: async (authorizationService: IAMAuthorizationService): Promise<AuthorizationData<unknown>> => {
          const acps = await authorizationService!.mapAuthorizationPoints(Constants.API_SSO_MODULE_NAME);
          return acps;
        },
        inject: [IAMAuthorizationService]
      }
    ]
  };
}
