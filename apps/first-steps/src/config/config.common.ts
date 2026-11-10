import * as path from 'node:path';

import { type AppConfigCommon, HttpMethod, RDBType } from '@node-c/core';

import { Constants } from '../common/definitions/common.constants.js';

export const appConfigCommon: AppConfigCommon = {
  api: {
    tasks: {
      anonymousAccessRoutes: {
        '/tasks': [
          HttpMethod.DELETE,
          HttpMethod.GET,
          HttpMethod.PATCH,
          HttpMethod.POST
        ],
        '/tasks/bulk': [HttpMethod.POST],
        '/tasks/item/:id': [HttpMethod.GET]
      }
    }
  },
  data: {
    db: {
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      database: 'first-steps.sqlite',
      type: RDBType.SQLite
    }
  },
  domain: {},
  general: {
    projectName: 'node-c-first-steps',
    projectRootPath: path.resolve(import.meta.dirname, '../../'),
    projectVersion: '1.0.0'
  }
};
