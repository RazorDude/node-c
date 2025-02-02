import { DynamicModule, Module } from '@nestjs/common';

import { SQLQueryBuilderModuleOptions } from './sqlQueryBuilder.definitions';
import { SQLQueryBuilderService } from './sqlQueryBuilder.service';

import { Constants } from '../common/definitions';

@Module({})
export class SQLQueryBuilderModule {
  static register(options: SQLQueryBuilderModuleOptions): DynamicModule {
    const { dbConfigPath } = options;
    return {
      module: SQLQueryBuilderModule,
      providers: [
        {
          provide: Constants.SQL_BUILDER_DB_CONFIG_PATH,
          useValue: dbConfigPath
        },
        SQLQueryBuilderService
      ],
      exports: [SQLQueryBuilderService]
    };
  }
}
