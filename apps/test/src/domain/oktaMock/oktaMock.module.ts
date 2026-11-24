import { Global, Module } from '@nestjs/common';

import {
  Constants as NodeCCoreConstants,
  loadDynamicModules
} from '@node-c/core';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './services/oktaMock.services.js';

const { services } = loadDynamicModules(FolderData);

/**
 * A mock of the Okta API's OAuth2 flow, used as the Okta provider of the IAM domain module in the e2e tests.
 */
@Global()
@Module({
  providers: [
    {
      provide: NodeCCoreConstants.DOMAIN_MODULE_NAME,
      useValue: Constants.DOMAIN_OKTA_MOCK_MODULE_NAME
    },
    ...services!
  ],
  exports: [...services!]
})
export class DomainOktaMockModule {}
