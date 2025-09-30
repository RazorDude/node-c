import { AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileTest: AppConfigProfile = {
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
  domain: {},
  general: { environment: AppEnvironment.Test }
};
