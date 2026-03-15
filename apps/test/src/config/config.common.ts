import * as path from 'path';

import { AppConfigCommon, EndpointSecurityMode, HttpMethod, NoSQLType, RDBType } from '@node-c/core';

import { Constants } from '../common/definitions';

export const appConfigCommon: AppConfigCommon = {
  api: {
    coursePlatform: { endpointSecurityMode: EndpointSecurityMode.Strict },
    sso: {
      anonymousAccessRoutes: {
        '/users/accessToken': [HttpMethod.POST],
        '/users/accessToken/callback/:authType': [HttpMethod.GET]
      }
    }
  },
  domain: {
    coursePlatform: {},
    iam: {
      accessTokenExpiryTimeInMinutes: 120,
      authServiceSettings: {
        okta: {
          oauth2: {
            codeChallengeMethod: 'S256',
            defaultScope: 'openid profile email',
            verifyTokensLocally: true
          }
        },
        userLocal: {
          secretKey: {
            secretKeyHMACAlgorithm: 'sha256'
          }
        }
      },
      defaultUserIdentifierField: 'id',
      refreshTokenExpiryTimeInHours: 24
    }
  },
  general: { projectName: 'node-c-app', projectRootPath: path.resolve(__dirname, '../../'), projectVersion: '1.0.0' },
  data: {
    audit: { type: RDBType.ClickHouse },
    cache: {
      defaultTTL: 3600,
      defaultIndividualSearchEnabled: true,
      storeKey: Constants.DATA_CACHE_STORE_KEY,
      ttlPerEntity: { users: 60000 },
      type: NoSQLType.Redis,
      useHashmap: false
    },
    cacheAuth: {
      // clusterMode: true,
      defaultIndividualSearchEnabled: true,
      defaultTTL: 600,
      // failOnConnectionError: false,
      // sentinelMode: true,
      storeDelimiter: ':',
      storeKey: Constants.DATA_CACHE_AUTH_STORE_KEY,
      type: NoSQLType.Valkey,
      useHashmap: true
    },
    db: {
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      // failOnConnectionError: false,
      type: RDBType.MySQL
    },
    dbConfigs: {
      connectionName: Constants.DATA_DB_CONFIGS_MODULE_CONNECTION_NAME,
      // failOnConnectionError: false,
      type: RDBType.MySQL
    }
    // pgDB: { type: RDBType.PG }
  }
};
