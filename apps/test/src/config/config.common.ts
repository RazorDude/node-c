import * as path from 'path';

import { RequestMethod } from '@nestjs/common';
import { AppConfigCommon, NoSQLType, RDBType } from '@node-c/core';

import { Constants } from '../common/definitions';

export const appConfigCommon: AppConfigCommon = {
  api: {
    admin: {
      anonymousAccessRoutes: {
        '/users/accesToken': [RequestMethod.POST]
      }
    }
  },
  domain: {
    administration: {},
    iam: {
      accessTokenExpiryTimeInMinutes: 120,
      defaultUserIdentifierField: 'id',
      refreshTokenExpiryTimeInHours: 24
    }
  },
  general: { projectName: 'node-c-app', projectRootPath: path.join(__dirname, '../../'), projectVersion: '1.0.0' },
  persistance: {
    cache: { type: NoSQLType.Redis, storeKey: Constants.PERSISTANCE_CACHE_STORE_KEY },
    cacheAuth: { type: NoSQLType.Redis, storeKey: Constants.PERSISTANCE_CACHE_AUTH_STORE_KEY },
    db: { type: RDBType.MySQL },
    dbConfigs: { type: RDBType.MySQL }
    // pgDB: { type: RDBType.PG }
  }
};
