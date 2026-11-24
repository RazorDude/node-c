import { type AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileEndToEndTests: AppConfigProfile = {
  api: {
    coursePlatformDelegated: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2071
    },
    coursePlatformFederated: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2061
    },
    coursePlatformStandalone: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2051
    },
    oktaMock: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2091
    },
    sso: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2081
    }
  },
  domain: {
    coursePlatformFederated: {
      authServiceSettings: {
        userLocal: {
          nodeC: {
            baseUrl: 'http://localhost:2081'
          }
        }
      }
    },
    coursePlatformStandalone: {
      authServiceSettings: {
        passthroughConsumer: {
          nodeC: {
            baseUrl: 'http://localhost:2081'
          }
        }
      }
    },
    iam: {
      authServiceSettings: {
        okta: {
          // the Okta mock API (apps/test/src/api/oktaMock)
          oauth2: {
            accessTokenAudiences: ['http://localhost:2091'],
            accessTokenGrantUrl: 'http://localhost:2091/oauth2/v1/token',
            allowedIncomingRedirectUris: [
              'http://localhost:2081/users/auth/okta'
            ],
            authorizationUrl: 'http://localhost:2091/oauth2/v1/authorize',
            issuerUri: 'http://localhost:2091',
            redirectUri: 'http://localhost:2081/users/auth/okta'
          }
        },
        userLocal: {
          secretKey: {
            secretKeyHMACAlgorithm: 'sha256'
          }
        }
      }
    }
  },
  general: { environment: AppEnvironment.Test }
};
