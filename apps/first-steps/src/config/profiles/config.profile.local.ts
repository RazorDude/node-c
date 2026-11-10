import { type AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileLocal: AppConfigProfile = {
  api: {
    tasks: {
      allowedOrigins: ['localhost'],
      hostname: '0.0.0.0',
      port: 3000
    }
  },
  general: { environment: AppEnvironment.Local }
};
