import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RDBModuleOptions } from './rdb.module.definitions';

import { ConfigProviderService } from '../../../common/configProvider';
import { loadDynamicModules } from '../../../common/utils';
import { SQLQueryBuilderModule } from '../sqlQueryBuilder';

// Note: the services here do not have a wrapping module intentionally - because of how TypeORM imports them,
// we want to have all of them in a single module, to be used as an array in TypeOrmModule.forRootAsync
@Module({})
export class RDBModule {
  static register(options: RDBModuleOptions): DynamicModule {
    const { connectionName, folderData, imports: additionalImports, moduleName } = options;
    const { atEnd: importsAtEnd, postORM: importsPostORM, preORM: importsPreORM } = additionalImports || {};
    const { entities, modules, services } = loadDynamicModules(folderData);
    return {
      module: RDBModule,
      imports: [
        ...(importsPreORM || []),
        TypeOrmModule.forRootAsync({
          useFactory: (configProvider: ConfigProviderService) => {
            const persistanceConfig = configProvider.config.persistance;
            // example : configProvider.config.persistance.db
            const { host, password, port } = persistanceConfig[moduleName as keyof typeof persistanceConfig];
            return Object.assign({}, { host, password, port }, { entities, name: connectionName });
          },
          inject: [ConfigProviderService]
        }),
        SQLQueryBuilderModule.register({ dbConfigPath: `config.persistance.${moduleName}` }),
        ...(importsPostORM || []),
        ...(modules || []),
        ...(importsAtEnd || [])
      ],
      providers: [...(services || []), ...(options.providers || [])],
      exports: [...(services || []), ...(options.exports || [])]
    };
  }
}
