import { AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileLocal: AppConfigProfile = {
  api: {
    coursePlatform: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2070
    },
    sso: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 2080
    }
  },
  domain: {},
  general: { environment: AppEnvironment.Local }
};
