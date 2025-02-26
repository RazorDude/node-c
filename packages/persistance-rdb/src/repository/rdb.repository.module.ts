import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObjectLiteral, Repository } from 'typeorm';

import { RDBRepositoryModuleOptions } from './rdb.repository.definitions';

import { Constants } from '../common/definitions';
import { SQLQueryBuilderService } from '../sqlQueryBuilder';

@Module({})
export class RDBRepositoryModule {
  static register<Entity extends ObjectLiteral>(options: RDBRepositoryModuleOptions): DynamicModule {
    const { entityClass, persistanceModuleName } = options;
    return {
      module: RDBRepositoryModule,
      imports: [TypeOrmModule.forFeature([entityClass])],
      providers: [
        {
          provide: SQLQueryBuilderService,
          useFactory: (redisStoreService: SQLQueryBuilderService) => redisStoreService,
          inject: [`${persistanceModuleName}${Constants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`]
        },
        Repository<Entity>
      ],
      exports: [TypeOrmModule, Repository<Entity>, SQLQueryBuilderService]
    };
  }
}
