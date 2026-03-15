import { AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileEndToEndTests: AppConfigProfile = {
  api: {
    coursePlatform: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2071
    },
    sso: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2081
    }
  },
  domain: {
    iam: {
      authServiceSettings: {
        okta: {
          oauth2: {
            accessTokenAudiences: ['https://integrator-4933645.okta.com'],
            accessTokenGrantUrl: 'https://integrator-4933645.okta.com/oauth2/v1/token',
            authorizationUrl: 'https://integrator-4933645.okta.com/oauth2/v1/authorize',
            issuerUri: 'https://integrator-4933645.okta.com',
            redirectUri: 'http://localhost:2081/users/accessToken/callback/okta'
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
