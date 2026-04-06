import { Module } from '@nestjs/common';

import {
  APP_CONFIG_FROM_ENV_KEYS,
  ConfigProviderModule,
  ConfigProviderModuleOptions,
  LoggerModule
} from '@node-c/core';

import ld from 'lodash';

import { APICoursePlatformDelegatedModule } from './api/coursePlatformDelegated';
import { APICoursePlatformFederatedModule } from './api/coursePlatformFederated';
import { APICoursePlatformStandaloneModule } from './api/coursePlatformStandalone';
import { APISSOModule } from './api/sso';
import * as AppConfigs from './config';
import { DataAuditModule } from './data/audit';
import { DataCacheModule } from './data/cache';
import { DataCacheAuthModule } from './data/cacheAuth';
import { DataCacheFederatedModule } from './data/cacheFederated';
import { DataCacheStandaloneModule } from './data/cacheStandalone';
import { DataDBModule } from './data/db';
import { DataDBConfigsModule } from './data/dbConfigs';
import { DomainCoursePlatformDelegatedModule } from './domain/coursePlatformDelegated';
import { DomainCoursePlatformFederatedModule } from './domain/coursePlatformFederated';
import { DomainCoursePlatformStandaloneModule } from './domain/coursePlatformStandalone';
import { DomainIAMModule } from './domain/iam';

export class AppModuleBase {
  static readonly configProviderModuleRegisterOptions: ConfigProviderModuleOptions = {
    appConfigs: AppConfigs as unknown as ConfigProviderModuleOptions['appConfigs'],
    envKeys: ld.merge(APP_CONFIG_FROM_ENV_KEYS, {
      DOMAIN: {
        COURSE_PLATFORM_DELEGATED: {
          JWT_ACCESS_SECRET: 'jwtAccessSecret',
          JWT_REFRESH_SECRET: 'jwtRefreshSecret'
        },
        COURSE_PLATFORM_FEDERATED: {
          JWT_ACCESS_SECRET: 'jwtAccessSecret',
          JWT_REFRESH_SECRET: 'jwtRefreshSecret',
          OKTA_CONSUMER_API_KEY: 'authServiceSettings.oktaConsumer.nodeC.apiKey',
          OKTA_CONSUMER_API_SECRET: 'authServiceSettings.oktaConsumer.nodeC.apiSecret',
          USER_LOCAL_CONSUMER_API_KEY: 'authServiceSettings.userLocalConsumer.nodeC.apiKey',
          USER_LOCAL_CONSUMER_API_SECRET: 'authServiceSettings.userLocalConsumer.nodeC.apiSecret'
        },
        COURSE_PLATFORM_STANDALONE: {
          JWT_ACCESS_SECRET: 'jwtAccessSecret',
          JWT_REFRESH_SECRET: 'jwtRefreshSecret',
          OAUTH2_OKTA_CLIENT_ID: 'authServiceSettings.okta.oauth2.clientId',
          OAUTH2_OKTA_CLIENT_SECRET: 'authServiceSettings.okta.oauth2.clientSecret',
          PASSTHROUGH_CONSUMER_API_KEY: 'authServiceSettings.passthroughConsumer.nodeC.apiKey',
          PASSTHROUGH_CONSUMER_API_SECRET: 'authServiceSettings.passthroughConsumer.nodeC.apiSecret',
          USER_LOCAL_PASSWORD_SECRET: 'authServiceSettings.userLocal.secretKey.hashingSecret'
        },
        IAM: {
          OAUTH2_OKTA_CLIENT_ID: 'authServiceSettings.okta.oauth2.clientId',
          OAUTH2_OKTA_CLIENT_SECRET: 'authServiceSettings.okta.oauth2.clientSecret',
          USER_LOCAL_PASSWORD_SECRET: 'authServiceSettings.userLocal.secretKey.hashingSecret'
        }
      }
    }),
    envKeysParentNames: {
      API: {
        children: {
          COURSE_PLATFORM_DELEGATED: 'coursePlatformDelegated', // _MODULE_TYPE - REST
          COURSE_PLATFORM_FEDERATED: 'coursePlatformFederated', // _MODULE_TYPE - REST
          COURSE_PLATFORM_STANDALONE: 'coursePlatformStandalone', // _MODULE_TYPE - REST
          SSO: 'sso' // _MODULE_TYPE - REST
        },
        name: 'api'
      },
      DOMAIN: {
        children: {
          COURSE_PLATFORM_DELEGATED: 'coursePlatformDelegated', // _MODULE_TYPE -
          COURSE_PLATFORM_FEDERATED: 'coursePlatformFederated', // _MODULE_TYPE -
          COURSE_PLATFORM_STANDALONE: 'coursePlatformStandalone', // _MODULE_TYPE -
          IAM: 'iam' // _MODULE_TYPE - IAM
        },
        name: 'domain'
      },
      DATA: {
        children: {
          AUDIT: 'audit', // _MODULE_TYPE - RDB
          CACHE: 'cache', // _MODULE_TYPE - NOSQL
          CACHE_AUTH: 'cacheAuth', // _MODULE_TYPE - NOSQL
          CACHE_FEDERATED: 'cacheFederated', // _MODULE_TYPE - NOSQL
          CACHE_STANDALONE: 'cacheStandalone', // _MODULE_TYPE - NOSQL
          DB: 'db', // _MODULE_TYPE - RDB
          DB_CONFIGS: 'dbConfigs' // _MODULE_TYPE - RDB
        },
        name: 'data'
      }
    },
    useEnvFile: true,
    useEnvFileWithPriority: true
  };
  static readonly imports = [
    ConfigProviderModule.register(AppModuleBase.configProviderModuleRegisterOptions),
    LoggerModule.register(),
    DataAuditModule.register(),
    DataCacheAuthModule.register(),
    DataCacheFederatedModule.register(),
    DataCacheModule.register(),
    DataCacheStandaloneModule.register(),
    DataDBConfigsModule.register(),
    DataDBModule.register(),
    DomainCoursePlatformFederatedModule,
    DomainCoursePlatformStandaloneModule
  ];
}

@Module({
  imports: [
    ...AppModuleBase.imports,
    APICoursePlatformDelegatedModule.register(APICoursePlatformDelegatedModule.moduleOptions),
    DomainCoursePlatformDelegatedModule,
    DomainIAMModule.register()
  ]
})
export class AppModuleCoursePlatformDelegated extends AppModuleBase {}

@Module({
  imports: [
    ...AppModuleBase.imports,
    APICoursePlatformFederatedModule.register(APICoursePlatformFederatedModule.moduleOptions),
    DomainCoursePlatformFederatedModule
  ]
})
export class AppModuleCoursePlatformFederated extends AppModuleBase {}

@Module({
  imports: [
    ...AppModuleBase.imports,
    APICoursePlatformStandaloneModule.register(APICoursePlatformStandaloneModule.moduleOptions),
    DomainCoursePlatformStandaloneModule
  ]
})
export class AppModuleCoursePlatformStandalone extends AppModuleBase {}

@Module({
  imports: [...AppModuleBase.imports, APISSOModule.register(APISSOModule.moduleOptions), DomainIAMModule.register()]
})
export class AppModuleSSO extends AppModuleBase {}
