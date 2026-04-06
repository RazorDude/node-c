import { AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileLocal: AppConfigProfile = {
  api: {
    coursePlatformDelegated: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2070
    },
    coursePlatformFederated: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2060
    },
    coursePlatformStandalone: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2050
    },
    sso: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2080
    }
  },
  domain: {
    coursePlatformFederated: {
      authServiceSettings: {
        okta: {
          nodeC: {
            baseUrl: 'http://localhost:2080'
          }
        },
        userLocal: {
          nodeC: {
            baseUrl: 'http://localhost:2080'
          }
        }
      }
    },
    coursePlatformStandalone: {
      authServiceSettings: {
        passthroughConsumer: {
          nodeC: {
            baseUrl: 'http://localhost:2080'
          }
        }
      }
    },
    iam: {
      authServiceSettings: {
        okta: {
          oauth2: {
            accessTokenAudiences: ['https://integrator-4933645.okta.com'],
            accessTokenGrantUrl: 'https://integrator-4933645.okta.com/oauth2/v1/token',
            authorizationUrl: 'https://integrator-4933645.okta.com/oauth2/v1/authorize',
            issuerUri: 'https://integrator-4933645.okta.com',
            redirectUri: 'http://localhost:2080/users/auth/okta'
            // redirectUri: 'http://localhost:2080/authn/okta/steps/complete'
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
  general: { environment: AppEnvironment.Local }
};
