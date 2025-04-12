import * as path from 'path';

import { AppConfigCommon, EndpointSecurityMode, HttpMethod, NoSQLType, RDBType } from '@node-c/core';

import { Constants } from '../common/definitions';

export const appConfigCommon: AppConfigCommon = {
  api: {
    coursePlatform: { endpointSecurityMode: EndpointSecurityMode.Strict },
    sso: {
      anonymousAccessRoutes: {
        '/users/accessToken': [HttpMethod.POST]
      }
    }
  },
  domain: {
    coursePlatform: {},
    iam: {
      accessTokenExpiryTimeInMinutes: 120,
      defaultUserIdentifierField: 'id',
      userPasswordHMACAlgorithm: 'sha256',
      refreshTokenExpiryTimeInHours: 24
    }
  },
  general: { projectName: 'node-c-app', projectRootPath: path.join(__dirname, '../../'), projectVersion: '1.0.0' },
  persistance: {
    audit: { type: RDBType.ClickHouse },
    cache: {
      defaultTTL: 3600,
      storeKey: Constants.PERSISTANCE_CACHE_STORE_KEY,
      ttlPerEntity: { users: 60000 },
      type: NoSQLType.Redis,
      useHashmap: false
    },
    cacheAuth: {
      defaultTTL: 600,
      storeDelimiter: ':',
      storeKey: Constants.PERSISTANCE_CACHE_AUTH_STORE_KEY,
      type: NoSQLType.Redis,
      useHashmap: true
    },
    db: { connectionName: Constants.PERSISTANCE_DB_MODULE_CONNECTION_NAME, type: RDBType.MySQL },
    dbConfigs: { connectionName: Constants.PERSISTANCE_DB_CONFIGS_MODULE_CONNECTION_NAME, type: RDBType.MySQL }
    // pgDB: { type: RDBType.PG }
  }
};
