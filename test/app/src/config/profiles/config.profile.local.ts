import { AppConfigProfile, AppEnvironment } from '@node-c/common/configProvider/configProvider.definitions';

export const appConfigProfileLocal: AppConfigProfile = {
  api: {
    admin: {
      allowedOrigins: ['localhost'],
      anonymousAccessRoutes: ['/tokens/test'],
      hostname: '0.0.0.0',
      port: 2080
    }
  },
  domain: {},
  general: { environment: AppEnvironment.Local }
};
