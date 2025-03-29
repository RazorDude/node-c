import { AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileTest: AppConfigProfile = {
  api: {
    sso: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 3010
    }
  },
  domain: {},
  general: { environment: AppEnvironment.Test }
};
