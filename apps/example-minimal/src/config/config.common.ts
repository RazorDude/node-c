import * as path from 'path';

import { AppConfigCommon, NoSQLType, RDBType } from '@node-c/core';

export const appConfigCommon: AppConfigCommon = {
  api: {
    admin: {}
  },
  domain: {
    admin: {
      refreshTokenExpiryTimeInHours: 24,
      sessionTokenExpiryTimeInMinutes: 120
    }
  },
  general: {
    projectName: 'node-c-example-minimal',
    projectRootPath: path.join(__dirname, '../../'),
    projectVersion: '1.0.0'
  },
  persistance: {
    cache: { type: NoSQLType.Redis }
  }
};
