import { AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileLocal: AppConfigProfile = {
  api: {
    sso: {
      allowedOrigins: ['localhost'],
      anonymousAccessRoutes: ['/tokens'],
      hostname: '0.0.0.0',
      port: 2080
    }
  },
  domain: {},
  general: { environment: AppEnvironment.Local }
};
