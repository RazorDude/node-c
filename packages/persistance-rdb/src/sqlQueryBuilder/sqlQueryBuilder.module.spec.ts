import { describe, expect, it } from 'vitest';

import { SQLQueryBuilderModule, SQLQueryBuilderModuleOptions, SQLQueryBuilderService } from './index';

import { Constants } from '../common/definitions';

describe('SQLQueryBuilderModule', () => {
  describe('register', () => {
    it('returns a dynamic module with correct providers and exports', () => {
      const options: SQLQueryBuilderModuleOptions = { dbConfigPath: '/config/db.json' };
      const dynamicModule = SQLQueryBuilderModule.register(options);
      expect(dynamicModule.module).toBe(SQLQueryBuilderModule);
      expect(dynamicModule.providers).toEqual([
        { provide: Constants.SQL_BUILDER_DB_CONFIG_PATH, useValue: '/config/db.json' },
        SQLQueryBuilderService
      ]);
      expect(dynamicModule.exports).toEqual([SQLQueryBuilderService]);
    });
  });
});
