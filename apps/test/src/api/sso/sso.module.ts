import { Module } from '@nestjs/common';

import {
  HTTPAPIModule as BaseHTTPAPIModule,
  HTTPAPIModuleOptions,
  Constants as NodeCConstants
} from '@node-c/api-http';

import { AccessControlData } from '@node-c/domain-iam';

import * as FolderData from './controllers';

import { Constants } from '../../common/definitions';
import { IAMAccessControlService } from '../../domain/iam';

@Module({})
export class SSOAPIModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: SSOAPIModule,
    moduleName: Constants.API_SSO_MODULE_NAME,
    providers: [
      {
        provide: NodeCConstants.API_MODULE_ACP,
        useFactory: async (accessControlService: IAMAccessControlService): Promise<AccessControlData<unknown>> => {
          const acps = await accessControlService!.mapAccessControlPoints(Constants.API_SSO_MODULE_NAME);
          return acps;
        },
        inject: [IAMAccessControlService]
      }
    ]
  };
}
