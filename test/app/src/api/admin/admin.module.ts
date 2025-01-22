import { Module } from '@nestjs/common';

import { HTTPAPIModule as BaseHTTPAPIModule, HTTPAPIModuleOptions } from '@node-c/api/http';
import { Constants as NodeCConstants } from '@node-c/common/definitions';

import * as FolderData from './controllers';

import { Constants } from '../../common/definitions';
import { IAMAccessControlService } from '../../domain/iam';

@Module({})
export class AdminAPIModule extends BaseHTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: AdminAPIModule,
    moduleName: Constants.API_ADMIN_MODULE_NAME,
    providers: [
      {
        provide: NodeCConstants.API_MODULE_ACP,
        useFactory: async (accessControlService: IAMAccessControlService) =>
          await accessControlService!.mapAccessControlPoints(Constants.API_ADMIN_MODULE_NAME),
        inject: [IAMAccessControlService]
      }
    ]
  };
}
