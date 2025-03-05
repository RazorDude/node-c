import { describe, expect, it } from 'vitest';

import { SQLQueryBuilderModule, SQLQueryBuilderModuleOptions, SQLQueryBuilderService } from './index';

import { Constants } from '../common/definitions';

describe('SQLQueryBuilderModule', () => {
  describe('register', () => {
    it('returns a dynamic module with correct providers and exports', () => {
      const persistanceModuleName = 'db';
      const options: SQLQueryBuilderModuleOptions = { persistanceModuleName };
      const dynamicModule = SQLQueryBuilderModule.register(options);
      const serviceToken = `${persistanceModuleName}${Constants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`;
      expect(dynamicModule.module).toBe(SQLQueryBuilderModule);
      expect(dynamicModule.providers).toEqual([
        { provide: Constants.SQL_BUILDER_DB_CONFIG_PATH, useValue: `config.persistance.${persistanceModuleName}` },
        { provide: serviceToken, useClass: SQLQueryBuilderService }
      ]);
      expect(dynamicModule.exports).toEqual([{ provide: serviceToken, useClass: SQLQueryBuilderService }]);
    });
  });
});
