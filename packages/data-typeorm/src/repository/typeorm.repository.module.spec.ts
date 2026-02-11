import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe, expect, it } from 'vitest';

import { RDBRepositoryModule } from './index';

import { Constants } from '../common/definitions/common.constants';
import { SQLQueryBuilderService } from '../sqlQueryBuilder';

class DummyEntity {}

describe('RDBRepositoryModule', () => {
  describe('register', () => {
    const dataModuleName = 'TestModule';
    const options = {
      entityClass: DummyEntity,
      dataModuleName
    };
    const dynamicModule = RDBRepositoryModule.register<DummyEntity>(options);
    it('should return a DynamicModule with the correct module property', () => {
      expect(dynamicModule.module).toBe(RDBRepositoryModule);
    });
    it('should include the correct imports', () => {
      expect(dynamicModule.imports).toBeDefined();
      expect(Array.isArray(dynamicModule.imports)).toBe(true);
      expect(dynamicModule.imports!.length).toBe(1);
      // The import should be the result of TypeOrmModule.forFeature, which we can assume is valid if defined.
      expect(dynamicModule.imports![0]).toBeDefined();
    });
    it('should include the correct providers', () => {
      expect(dynamicModule.providers).toBeDefined();
      expect(Array.isArray(dynamicModule.providers)).toBe(true);
      expect(dynamicModule.providers!.length).toBe(2);
      // Find the provider for SQLQueryBuilderService.
      const sqlProvider = dynamicModule.providers!.find(
        (
          provider
        ): provider is {
          provide: typeof SQLQueryBuilderService;
          useFactory: (_dep: SQLQueryBuilderService) => SQLQueryBuilderService;
          inject: string[];
        } =>
          typeof provider === 'object' &&
          provider !== null &&
          'provide' in provider &&
          provider.provide === SQLQueryBuilderService
      );
      expect(sqlProvider).toBeDefined();
      if (sqlProvider) {
        expect(typeof sqlProvider.useFactory).toBe('function');
        // Verify that the factory returns its argument.
        const dummyService = {} as SQLQueryBuilderService;
        expect(sqlProvider.useFactory(dummyService)).toBe(dummyService);
        // Check that the inject token is formed correctly.
        expect(sqlProvider.inject).toEqual([`${dataModuleName}${Constants.SQL_BUILDER_SERVICE_TOKEN_SUFFIX}`]);
      }
      // Check that the Repository provider is present.
      const repositoryProvider = dynamicModule.providers!.find(provider => provider === Repository);
      expect(repositoryProvider).toBe(Repository);
    });
    it('should include the correct exports', () => {
      expect(dynamicModule.exports).toBeDefined();
      expect(Array.isArray(dynamicModule.exports)).toBe(true);
      // The module exports TypeOrmModule, Repository, and SQLQueryBuilderService.
      expect(dynamicModule.exports).toEqual([TypeOrmModule, Repository, SQLQueryBuilderService]);
    });
  });
});
