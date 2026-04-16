import * as path from 'path';

import { AppConfigCommon, EndpointSecurityMode, HttpMethod, NoSQLType, RDBType } from '@node-c/core';

import { Constants } from '../common/definitions';

export const appConfigCommon: AppConfigCommon = {
  api: {
    coursePlatformDelegated: {
      endpointSecurityMode: EndpointSecurityMode.Strict,
      localSearchForUsersEnabledOnAuthorization: false
    },
    coursePlatformFederated: {
      anonymousAccessRoutes: {
        '/users/auth/okta': [
          // special allowance for testing the oauth2 callback directly, since we don't have a UI
          HttpMethod.GET,
          // only the initiate step here is needed, since the complete step is via the GET above
          HttpMethod.POST
        ],
        '/users/auth/userLocal': [HttpMethod.PATCH, HttpMethod.POST]
      }
    },
    coursePlatformStandalone: {
      anonymousAccessRoutes: {
        '/users/auth/okta': [
          // special allowance for testing the oauth2 callback directly, since we don't have a UI
          HttpMethod.GET,
          // only the initiate step here is needed, since the complete step is via the GET above
          HttpMethod.POST
        ],
        '/users/auth/userLocal': [HttpMethod.PATCH, HttpMethod.POST]
      }
    },
    sso: {
      allowedApiKeyRoutes: {
        '/users/auth/passthrough': [HttpMethod.PATCH, HttpMethod.POST]
      },
      apiSecretAlgorigthm: 'sha256',
      anonymousAccessRoutes: {
        '/users/auth/okta': [
          // special allowance for testing the oauth2 callback directly, since we don't have a UI
          HttpMethod.GET,
          // "complete" step  when acting as an authentication provider
          HttpMethod.PATCH,
          // "initiate step"
          HttpMethod.POST
        ],
        '/users/auth/userLocal': [HttpMethod.PATCH, HttpMethod.POST]
      }
    }
  },
  domain: {
    coursePlatformFederated: {
      accessTokenExpiryTimeInMinutes: 1,
      authServiceSettings: {
        okta: {
          nodeC: {
            apiSecretHashingAlgorithm: 'sha256',
            completeEndpoint: '/users/auth/okta',
            completeEndpointMethod: HttpMethod.PATCH,
            initiateEndpoint: '/users/auth/okta',
            initiateEndpointMethod: HttpMethod.POST,
            refreshExternalAccessTokenEndpoint: '/users/auth/okta',
            refreshExternalAccessTokenEndpointMethod: HttpMethod.PUT
          }
        },
        userLocal: {
          nodeC: {
            apiSecretHashingAlgorithm: 'sha256',
            completeEndpoint: '/users/auth/userLocal',
            completeEndpointMethod: HttpMethod.PATCH,
            initiateEndpoint: '/users/auth/userLocal',
            initiateEndpointMethod: HttpMethod.POST,
            refreshExternalAccessTokenEndpoint: '/users/auth/userLocal',
            refreshExternalAccessTokenEndpointMethod: HttpMethod.PUT
          }
        }
      },
      checkAccessTokenExistenceLocally: true,
      defaultUserIdentifierField: 'id',
      refreshTokenExpiryTimeInHours: 24
    },
    coursePlatformStandalone: {
      accessTokenExpiryTimeInMinutes: 1,
      authServiceSettings: {
        okta: {
          oauth2: {
            codeChallengeMethod: 'S256',
            defaultScope: 'openid profile email groups offline_access',
            verifyTokensLocally: true
          }
        },
        passthroughConsumer: {
          nodeC: {
            apiSecretHashingAlgorithm: 'sha256',
            completeEndpoint: '/users/auth/passthrough',
            completeEndpointMethod: HttpMethod.PATCH,
            initiateEndpoint: '/users/auth/passthrough',
            initiateEndpointMethod: HttpMethod.POST,
            refreshExternalAccessTokenEndpoint: '/users/auth/passthrough',
            refreshExternalAccessTokenEndpointMethod: HttpMethod.PUT
          }
        },
        userLocal: {
          secretKey: {
            secretKeyHMACAlgorithm: 'sha256'
          }
        }
      },
      checkAccessTokenExistenceLocally: true,
      defaultUserIdentifierField: 'id',
      refreshTokenExpiryTimeInHours: 24
    },
    iam: {
      accessTokenExpiryTimeInMinutes: 1,
      authServiceSettings: {
        okta: {
          oauth2: {
            codeChallengeMethod: 'S256',
            defaultScope: 'openid profile email groups offline_access',
            verifyTokensLocally: true
          }
        },
        passthrough: {},
        userLocal: {
          secretKey: {
            secretKeyHMACAlgorithm: 'sha256'
          }
        }
      },
      checkAccessTokenExistenceLocally: true,
      defaultUserIdentifierField: 'id',
      refreshTokenExpiryTimeInHours: 24
    }
  },
  general: {
    projectName: 'node-c-test-app',
    projectRootPath: path.resolve(__dirname, '../../'),
    projectVersion: '1.0.0'
  },
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
      useHashmap: false
    },
    cacheFederated: {
      defaultTTL: 3600,
      defaultIndividualSearchEnabled: true,
      storeKey: Constants.DATA_CACHE_FEDERATED_STORE_KEY,
      ttlPerEntity: { users: 60000 },
      type: NoSQLType.Valkey,
      useHashmap: false
    },
    cacheStandalone: {
      defaultTTL: 3600,
      defaultIndividualSearchEnabled: true,
      storeKey: Constants.DATA_CACHE_STANDALONE_STORE_KEY,
      ttlPerEntity: { users: 60000 },
      type: NoSQLType.Valkey,
      useHashmap: false
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
