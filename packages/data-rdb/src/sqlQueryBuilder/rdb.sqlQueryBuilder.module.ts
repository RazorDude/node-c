import { DynamicModule, Module } from '@nestjs/common';

import { Constants as CoreConstants } from '@node-c/core';

import { SQLQueryBuilderModuleOptions } from './rdb.sqlQueryBuilder.definitions';
import { SQLQueryBuilderService } from './rdb.sqlQueryBuilder.service';

import { Constants } from '../common/definitions';

@Module({})
export class SQLQueryBuilderModule {
  static register(options: SQLQueryBuilderModuleOptions): DynamicModule {
    const { dataModuleName } = options;
    const serviceToken = `${dataModuleName}${Constants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`;
    return {
      global: true,
      module: SQLQueryBuilderModule,
      providers: [
        {
          provide: Constants.SQL_BUILDER_DB_CONFIG_PATH,
          useValue: `config.data.${dataModuleName}`
        },
        {
          provide: CoreConstants.PERSISTANCE_MODULE_NAME,
          useValue: dataModuleName
        },
        { provide: serviceToken, useClass: SQLQueryBuilderService }
      ],
      exports: [{ provide: serviceToken, useClass: SQLQueryBuilderService }]
    };
  }
}
