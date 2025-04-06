import { DynamicModule, Module } from '@nestjs/common';

import { SQLQueryBuilderModuleOptions } from './rdb.sqlQueryBuilder.definitions';
import { SQLQueryBuilderService } from './rdb.sqlQueryBuilder.service';

import { Constants } from '../common/definitions';

@Module({})
export class SQLQueryBuilderModule {
  static register(options: SQLQueryBuilderModuleOptions): DynamicModule {
    const { persistanceModuleName } = options;
    const serviceToken = `${persistanceModuleName}${Constants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`;
    return {
      global: true,
      module: SQLQueryBuilderModule,
      providers: [
        {
          provide: Constants.SQL_BUILDER_DB_CONFIG_PATH,
          useValue: `config.persistance.${persistanceModuleName}`
        },
        { provide: serviceToken, useClass: SQLQueryBuilderService }
      ],
      exports: [{ provide: serviceToken, useClass: SQLQueryBuilderService }]
    };
  }
}
