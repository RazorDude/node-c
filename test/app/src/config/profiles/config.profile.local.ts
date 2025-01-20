import { AppConfigProfile, AppEnvironment } from '@node-c/common/configProvider/configProvider.definitions';

export const appConfigProfileLocal: AppConfigProfile = {
  api: {
    identity: {
      allowedOrigins: ['localhost'],
      hostname: 'localhost',
      port: 2080
    }
  },
  domain: {},
  general: { environment: AppEnvironment.Local }
};
