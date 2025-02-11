import * as path from 'path';

import { AppConfigCommon, NoSQLType, RDBType } from '@node-c/core';

export const appConfigCommon: AppConfigCommon = {
  api: {
    admin: {}
  },
  domain: {
    administration: {},
    iam: {
      refreshTokenExpiryTimeInHours: 24,
      sessionTokenExpiryTimeInMinutes: 120
    }
  },
  general: { projectName: 'node-c-app', projectRootPath: path.join(__dirname, '../../'), projectVersion: '1.0.0' },
  persistance: {
    cache: { type: NoSQLType.Redis },
    main: { type: RDBType.MySQL }
    // pgDB: { type: RDBType.PG }
  }
};
