import { ConfigProviderService, RDBType, SelectOperator } from '@node-c/core';
import { SelectQueryBuilder } from 'typeorm';
import { describe, expect, it } from 'vitest';

import { FakeOtherQueryBuilder, FakeSelectQueryBuilder } from './sqlQueryBuilder.service.helpers.spec';

import { BuildQueryOptions, SQLQueryBuilderService } from './index';

import { Constants } from '../common/definitions';

// In these tests we simulate a config provider by creating a plain object that contains
// the configuration at the key given by the SQL builder config path. The getNested method
// (from @ramster/general-tools) will read the nested property from this object.
describe('SQLQueryBuilderService', () => {
  describe('constructor', () => {
    it('should initialize correctly for MySQL configuration', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.MySQL }
      } as unknown as ConfigProviderService;
      const dbConfigPath = Constants.SQL_BUILDER_DB_CONFIG_PATH;
      const service = new SQLQueryBuilderService(configProvider, dbConfigPath);
      expect(service.dbType).toBe(RDBType.MySQL);
      expect(service.columnQuotesSymbol).toBe('`');
      expect(service.iLikeSupported).toBe(false);
      expect(service.allowedStringOperators).toEqual(Object.values(SelectOperator));
      expect(service.configProvider).toBe(configProvider);
      expect(service.dbConfigPath).toBe(dbConfigPath);
    });
    it('should initialize correctly for PostgreSQL configuration', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const dbConfigPath = Constants.SQL_BUILDER_DB_CONFIG_PATH;
      const service = new SQLQueryBuilderService(configProvider, dbConfigPath);
      expect(service.dbType).toBe(RDBType.PG);
      expect(service.columnQuotesSymbol).toBe('"');
      expect(service.iLikeSupported).toBe(true);
    });
    it('should leave columnQuotesSymbol and iLikeSupported undefined for an unknown DB type', () => {
      // Here we simulate an unsupported DB type by casting a string to RDBType.
      const unknownType = 'other' as RDBType;
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: unknownType }
      } as unknown as ConfigProviderService;
      const dbConfigPath = Constants.SQL_BUILDER_DB_CONFIG_PATH;
      const service = new SQLQueryBuilderService(configProvider, dbConfigPath);
      expect(service.dbType).toBe(unknownType);
      expect(service.columnQuotesSymbol).toBeUndefined();
      expect(service.iLikeSupported).toBeUndefined();
    });
  });

  describe('buildQuery', () => {
    // Create configuration objects to set the column quote symbol.
    const mysqlConfig: ConfigProviderService = {
      [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.MySQL }
    } as unknown as ConfigProviderService;
    const pgConfig: ConfigProviderService = {
      [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
    } as unknown as ConfigProviderService;
    it('should process withDeleted, include, select, where and orderBy for a SelectQueryBuilder (withDeleted true, PG config)', () => {
      const service = new SQLQueryBuilderService(pgConfig, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      // For PG config, columnQuotesSymbol is `"` (double quote)
      const fakeQB = new FakeSelectQueryBuilder<Record<string, unknown>>();
      const options = {
        withDeleted: true,
        include: { relation1: 'alias1' },
        select: ['col1', 'relation1.fieldA'],
        orderBy: [{ field: 'col2', direction: 'DESC' }],
        where: {
          cond1: { query: 'query1', params: { param1: 1 } },
          cond2: { query: 'query2', params: { param2: 2 } }
        }
      };
      service.buildQuery(
        fakeQB as unknown as SelectQueryBuilder<Record<string, unknown>>,
        options as unknown as BuildQueryOptions
      );
      // withDeleted branch.
      expect(fakeQB.withDeletedCalls).toBe(1);
      // For include: withDeleted true calls leftJoinAndSelect with two arguments.
      expect(fakeQB.leftJoinAndSelectCalls.length).toBe(1);
      expect(fakeQB.leftJoinAndSelectCalls[0]).toEqual({
        relation: 'relation1',
        alias: 'alias1',
        condition: undefined
      });
      // select branch: parseSelect converts 'relation1.fieldA' to 'alias1.fieldA'
      expect(fakeQB.selectCalls.length).toBe(1);
      expect(fakeQB.selectCalls[0]).toEqual(['col1', 'alias1.fieldA']);
      // where branch: first condition calls "where", second calls "andWhere".
      expect(fakeQB.whereCalls.length).toBe(1);
      expect(fakeQB.whereCalls[0]).toEqual({ query: 'query1', params: { param1: 1 } });
      expect(fakeQB.andWhereCalls.length).toBe(1);
      expect(fakeQB.andWhereCalls[0]).toEqual({ query: 'query2', params: { param2: 2 } });
      // orderBy branch: first order by calls "orderBy".
      expect(fakeQB.orderByCalls.length).toBe(1);
      expect(fakeQB.orderByCalls[0]).toEqual({ field: 'col2', direction: 'DESC' });
    });
    it('should process include with withDeleted false for a SelectQueryBuilder (MySQL config)', () => {
      const service = new SQLQueryBuilderService(mysqlConfig, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      // For MySQL, columnQuotesSymbol is the backtick (`).
      const fakeQB = new FakeSelectQueryBuilder<Record<string, unknown>>();
      const options = {
        // withDeleted is false by default.
        include: { relation2: 'alias2' }
      };
      service.buildQuery(fakeQB as unknown as SelectQueryBuilder<Record<string, unknown>>, options);
      // withDeleted not called.
      expect(fakeQB.withDeletedCalls).toBe(0);
      // With withDeleted false, leftJoinAndSelect is called with a condition.
      expect(fakeQB.leftJoinAndSelectCalls.length).toBe(1);
      // Expected condition: "`alias2`.`deletedAt` IS NULL"
      expect(fakeQB.leftJoinAndSelectCalls[0]).toEqual({
        relation: 'relation2',
        alias: 'alias2',
        condition: '`alias2`.`deletedAt` IS NULL'
      });
      // No select, where or orderBy provided.
      expect(fakeQB.selectCalls.length).toBe(0);
      expect(fakeQB.whereCalls.length).toBe(0);
      expect(fakeQB.andWhereCalls.length).toBe(0);
      expect(fakeQB.orderByCalls.length).toBe(0);
      expect(fakeQB.addOrderByCalls.length).toBe(0);
    });
    it('should not call where methods for where items with an empty query string', () => {
      const service = new SQLQueryBuilderService(pgConfig, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const fakeQB = new FakeSelectQueryBuilder<Record<string, unknown>>();
      const options = {
        where: {
          condEmpty: { query: '', params: {} },
          condValid: { query: 'validQuery', params: { a: 1 } }
        }
      };
      service.buildQuery(fakeQB as unknown as SelectQueryBuilder<Record<string, unknown>>, options);
      // The empty query is skipped; only one where call should be made.
      expect(fakeQB.whereCalls.length).toBe(1);
      expect(fakeQB.whereCalls[0]).toEqual({ query: 'validQuery', params: { a: 1 } });
    });
    it('should process where for non-select query builders and ignore select/include/orderBy branches', () => {
      const service = new SQLQueryBuilderService(pgConfig, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const fakeQB = new FakeOtherQueryBuilder();
      const options = {
        where: {
          cond1: { query: 'nonSelectQuery1', params: { b: 2 } },
          cond2: { query: 'nonSelectQuery2', params: { b: 3 } }
        },
        // Even if include, select, or orderBy are provided, they should not be processed.
        include: { dummy: 'dummyAlias' },
        select: ['colX'],
        orderBy: [{ field: 'colY', direction: 'ASC' }]
      };
      service.buildQuery(
        fakeQB as unknown as SelectQueryBuilder<Record<string, unknown>>,
        options as unknown as BuildQueryOptions
      );
      // where branch should execute regardless.
      expect(fakeQB.whereCalls.length).toBe(1);
      expect(fakeQB.whereCalls[0]).toEqual({ query: 'nonSelectQuery1', params: { b: 2 } });
      expect(fakeQB.andWhereCalls.length).toBe(1);
      expect(fakeQB.andWhereCalls[0]).toEqual({ query: 'nonSelectQuery2', params: { b: 3 } });
      // No join, select or orderBy methods are available on FakeOtherQueryBuilder.
    });
  });

  describe('getValueForFilter', () => {
    const dateValue = new Date(2023, 0, 1); // January 1, 2023
    const entityName = 'entity';
    const fieldAlias = 'alias$'; // will be transformed to 'alias__ds__'
    const fieldName = 'field';
    const plainValue = 123;
    it('should handle operator Contains for MySQL', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.MySQL }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.Contains
      );
      const expectedFieldString = `\`${entityName}\`.\`${fieldName}\``;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `JSON_CONTAINS(${expectedFieldString}, :alias__ds__)`
      });
    });
    it('should handle operator Contains for PG', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.Contains
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} ? :alias__ds__`
      });
    });
    it('should handle operator GreaterThan', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.GreaterThan
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} > :alias__ds__`
      });
    });
    it('should handle operator GreaterThanOrEqual', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.GreaterThanOrEqual
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} >= :alias__ds__`
      });
    });
    it('should handle operator LessThan', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.LessThan
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} < :alias__ds__`
      });
    });
    it('should handle operator LessThanOrEqual', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.LessThanOrEqual
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} <= :alias__ds__`
      });
    });
    it('should handle operator Like when isNot is false', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.Like
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} like :alias__ds__`
      });
    });
    it('should handle operator Like when isNot is true', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        true,
        SelectOperator.Like
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} not like :alias__ds__`
      });
    });
    it('should handle operator ILike when iLikeSupported is false', () => {
      // For MySQL, iLikeSupported is false.
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.MySQL }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      // Even if operator is ILike, it falls back to like because iLikeSupported is false.
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.ILike
      );
      const expectedFieldString = `\`${entityName}\`.\`${fieldName}\``;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} like :alias__ds__`
      });
    });
    it('should handle operator ILike when iLikeSupported is true and isNot is false', () => {
      // For PG, iLikeSupported is true.
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        false,
        SelectOperator.ILike
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: typeof plainValue },
        query: `${expectedFieldString} ilike :alias__ds__`
      });
    });
    it('should handle operator ILike when iLikeSupported is true and isNot is true', () => {
      // For PG, iLikeSupported is true.
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        plainValue,
        true,
        SelectOperator.ILike
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: typeof plainValue },
        query: `${expectedFieldString} not ilike :alias__ds__`
      });
    });
    it('should handle the default case when operator is not provided and isNot is false', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(entityName, fieldName, fieldAlias, plainValue, false);
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} = :alias__ds__`
      });
    });
    it('should handle the default case when operator is not provided and isNot is true', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(entityName, fieldName, fieldAlias, plainValue, true);
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: plainValue },
        query: `${expectedFieldString} != :alias__ds__`
      });
    });
    it('should correctly parse Date values', () => {
      const configProvider: ConfigProviderService = {
        [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
      } as unknown as ConfigProviderService;
      const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
      const result = service.getValueForFilter(
        entityName,
        fieldName,
        fieldAlias,
        dateValue,
        false,
        SelectOperator.GreaterThan
      );
      const expectedFieldString = `"${entityName}"."${fieldName}"`;
      expect(result).toEqual({
        params: { alias__ds__: dateValue.valueOf() },
        query: `${expectedFieldString} > :alias__ds__`
      });
    });
  });

  describe('parseArrayOfFilters', () => {
    // Create a minimal config provider (the DB type doesn't affect this method).
    const configProvider: ConfigProviderService = {
      [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
    } as unknown as ConfigProviderService;
    const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
    it('should return false hasValues and empty strings/objects for an empty array', () => {
      const result = service.parseArrayOfFilters([], 'test');
      expect(result.hasValues).toBe(false);
      expect(result.isSimple).toBe(true);
      expect(result.paramsForQuery).toEqual({});
      expect(result.queryTemplateParamNames).toEqual('');
    });
    it('should skip undefined values and return no values', () => {
      const result = service.parseArrayOfFilters([undefined, undefined], 'test');
      expect(result.hasValues).toBe(false);
      expect(result.isSimple).toBe(true);
      expect(result.paramsForQuery).toEqual({});
      expect(result.queryTemplateParamNames).toEqual('');
    });
    it('should process an array of primitives correctly', () => {
      const arr = [42, 'abc', true, null];
      const result = service.parseArrayOfFilters(arr, 'test');
      expect(result.hasValues).toBe(true);
      expect(result.isSimple).toBe(true);
      expect(result.paramsForQuery).toEqual({
        test_0: 42,
        test_1: 'abc',
        test_2: true,
        test_3: null
      });
      expect(result.queryTemplateParamNames).toEqual(':test_0, :test_1, :test_2, :test_3, ');
    });
    it('should process Date objects correctly', () => {
      const date = new Date(2020, 0, 1);
      const arr = [date];
      const result = service.parseArrayOfFilters(arr, 'date');
      expect(result.hasValues).toBe(true);
      expect(result.isSimple).toBe(true);
      expect(result.paramsForQuery).toEqual({
        date_0: date.valueOf()
      });
      expect(result.queryTemplateParamNames).toEqual(':date_0, ');
    });
    it('should mark as non-simple and break on a non-primitive non-Date value (object)', () => {
      const arr = [{ key: 'value' }];
      const result = service.parseArrayOfFilters(arr, 'obj');
      expect(result.hasValues).toBe(true);
      expect(result.isSimple).toBe(false);
      expect(result.paramsForQuery).toEqual({});
      expect(result.queryTemplateParamNames).toEqual('');
    });
    it('should process initial primitives then break on the first non-primitive', () => {
      const arr = [42, { key: 'value' }, 100];
      const result = service.parseArrayOfFilters(arr, 'mix');
      expect(result.hasValues).toBe(true);
      expect(result.isSimple).toBe(false);
      // Only the first element is processed before breaking out.
      expect(result.paramsForQuery).toEqual({ mix_0: 42 });
      expect(result.queryTemplateParamNames).toEqual(':mix_0, ');
    });
    it('should process symbols correctly', () => {
      const sym = Symbol('sym');
      const arr = [sym];
      const result = service.parseArrayOfFilters(arr, 'sym');
      expect(result.hasValues).toBe(true);
      expect(result.isSimple).toBe(true);
      expect(result.paramsForQuery).toEqual({ sym_0: sym });
      expect(result.queryTemplateParamNames).toEqual(':sym_0, ');
    });
    it('should process bigints correctly', () => {
      const big = 9007199254740991;
      const arr = [big];
      const result = service.parseArrayOfFilters(arr, 'big');
      expect(result.hasValues).toBe(true);
      expect(result.isSimple).toBe(true);
      expect(result.paramsForQuery).toEqual({ big_0: big });
      expect(result.queryTemplateParamNames).toEqual(':big_0, ');
    });
  });

  describe('parseFilters', () => {
    // Use a PG configuration so that columnQuotesSymbol is a double quote.
    const configProvider: ConfigProviderService = {
      [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
    } as unknown as ConfigProviderService;
    const entityName = 'entity';
    const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
    it('should return empty where and include when filters is empty', () => {
      const filters = {};
      const result = service.parseFilters(entityName, filters, { isTopLevel: true });
      expect(result.where).toEqual({});
      expect(result.include).toEqual({});
    });
    it('should skip filters with undefined values', () => {
      const filters = { a: undefined, b: 42 };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true });
      expect(result.where).not.toHaveProperty('a');
      expect(result.where).toHaveProperty('b');
      // b is processed via getValueForFilter so its query should contain " = "
      expect(result.where.b.query).toContain(' = ');
    });
    it('should handle a primitive filter value via getValueForFilter', () => {
      const filters = { field1: 123 };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true });
      // For PG, getValueForFilter returns something like:
      //   "entity"."field1" = :field1
      expect(result.where.field1.query).toContain(' = ');
      expect(result.where.field1.params).toEqual({ field1: 123 });
      expect(result.include).toEqual({});
    });
    it('should handle a null filter value', () => {
      const filters = { fieldNull: null };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true });
      // Expect query to contain "is null"
      expect(result.where.fieldNull.query).toContain(' is ');
      expect(result.where.fieldNull.query).toContain('null');
    });
    it('should handle a null filter value with operator Not', () => {
      const filters = { fieldNull: null };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true, operator: SelectOperator.Not });
      // The query should contain "is not null"
      expect(result.where.fieldNull.query).toContain(' is not ');
      expect(result.where.fieldNull.query).toContain('null');
    });
    it('should handle relation field filters', () => {
      const filters = { 'relation.field': 'value' };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true });
      // In the relation branch, the method builds an alias by appending "_relation" to the entity name.
      // It also populates the include object with a key like "entity.relation" => "entity_relation".
      expect(result.include).toHaveProperty('entity.relation', 'entity_relation');
      // The where condition for "relation.field" is built via an inner parseFilters call.
      // Expect its query to contain an equality condition.
      expect(result.where['relation.field'].query).toContain(' = ');
    });
    it('should handle an array of primitives with an in clause', () => {
      const filters = { arr: [1, 2, 3] };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true });
      // For a simple array (all primitives/dates), the branch uses "in (...)"
      expect(result.where.arr.query).toContain(' in (');
      // Expect the parameters to have keys "arr_0", "arr_1", "arr_2"
      expect(result.where.arr.params).toEqual({ arr_0: 1, arr_1: 2, arr_2: 3 });
    });
    it('should handle an array of primitives with Between operator', () => {
      const filters = { arr: [10, 20] };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true, operator: SelectOperator.Between });
      // When using the Between operator, the query should include "between :arr_0 and :arr_1"
      expect(result.where.arr.query).toContain('between');
      expect(result.where.arr.params).toEqual({ arr_0: 10, arr_1: 20 });
    });
    it('should handle an array of non-simple values', () => {
      // A non-simple array is detected when an element is not a primitive or Date.
      // Here we pass an array with an object element.
      const filters = { arr: [{ a: 1 }] };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true });
      // The non-simple branch calls parseInnerFilters.
      // We expect the resulting query to be built from the inner filter (which, for { a: 1 },
      // would yield something like: ("entity"."a" = :a) ).
      expect(result.where.arr.query).toContain(' = ');
      // Parameters should come from the inner filter – we check that at least one key exists.
      expect(Object.keys(result.where.arr.params!).length).toBeGreaterThan(0);
    });
    it('should handle nested object filters (non-array, non-Date)', () => {
      const filters = { obj: { a: 1 } };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true });
      // In this branch, parseInnerFilters is used.
      // The inner call should produce a query that contains an equality condition for field "a".
      expect(result.where.obj.query).toContain(' = ');
      // There should be a parameter for "a" (the exact key depends on inner aliasing).
      expect(Object.keys(result.where.obj.params!).length).toBeGreaterThan(0);
    });
    it('should handle operator Not for a primitive filter value', () => {
      const filters = { field1: 123 };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true, operator: SelectOperator.Not });
      // When operator is Not, getValueForFilter is called with isNot = true,
      // so the query should use "!=" instead of "=".
      expect(result.where.field1.query).toContain(' != ');
    });
    it('should handle Or operator for an array when field name equals SelectOperator.Or', () => {
      // When the top-level field name equals SelectOperator.Or (typically "or"),
      // the branch processes the array items specially.
      const filters = { [SelectOperator.Or]: [{ a: 1 }, { a: 2 }] };
      const result = service.parseFilters(entityName, filters, { isTopLevel: true, operator: SelectOperator.Or });
      // The resulting query is built by concatenating inner filter queries with " or " and wrapping in parentheses.
      const orQuery = result.where[SelectOperator.Or].query.trim();
      expect(orQuery.startsWith('(')).toBe(true);
      expect(orQuery.endsWith(')')).toBe(true);
      expect(orQuery).toContain(' or ');
      // Ensure that parameters from both inner filters are present.
      expect(Object.keys(result.where[SelectOperator.Or].params!).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('parseInnerFilters', () => {
    // Use a PG configuration so that columnQuotesSymbol is a double quote (")
    const configProvider: ConfigProviderService = {
      [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
    } as unknown as ConfigProviderService;
    const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
    const entityName = 'entity';
    it('should parse a single-key filter object correctly (non-OR branch)', () => {
      // Here filtersObject has one key. Note that fieldName is used (since it is not "or").
      const filtersObject = { key: 10 };
      const fieldName = 'field';
      const fieldAlias = 'alias';
      const result = service.parseInnerFilters(entityName, filtersObject, fieldName, fieldAlias);
      // parseFilters is invoked internally with { field: 10 } and field alias "alias_0".
      // For PG, getValueForFilter returns a query like: "entity"."field" = :alias_0
      expect(result.parsedFilter.query).toBe('"entity"."field" = :alias_0');
      expect(result.parsedFilter.params).toEqual({ alias_0: 10 });
      expect(result.include).toEqual({});
    });
    it('should parse a multi-key filter object (non-OR) using "and" with brackets', () => {
      // With multiple keys and fieldName not equal to SelectOperator.Or,
      // actualFieldName remains constant ("field") for each iteration.
      const filtersObject = { key1: 10, key2: 20 };
      const fieldName = 'field';
      const fieldAlias = 'alias';
      const result = service.parseInnerFilters(entityName, filtersObject, fieldName, fieldAlias);
      // Since there are two keys, hasBrackets is true and the inner queries are wrapped.
      // The first iteration produces: ("entity"."field" = :alias_0)
      // The second iteration appends:  and ("entity"."field" = :alias_1)
      const expectedQuery = '("entity"."field" = :alias_0) and ("entity"."field" = :alias_1)';
      expect(result.parsedFilter.query).toBe(expectedQuery);
      expect(result.parsedFilter.params).toEqual({ alias_0: 10, alias_1: 20 });
      expect(result.include).toEqual({});
    });
    it('should parse a multi-key filter object with fieldName as SelectOperator.Or using "or"', () => {
      // When fieldName equals SelectOperator.Or, the actual field name becomes the key.
      const filtersObject = { a: 10, b: 20 };
      const fieldName = SelectOperator.Or;
      const fieldAlias = 'alias';
      // Pass the operator as OR so that the conjunction becomes " or "
      const result = service.parseInnerFilters(entityName, filtersObject, fieldName, fieldAlias, SelectOperator.Or);
      // For key "a": inner query becomes: ("entity"."a" = :alias_0)
      // For key "b": inner query becomes: or ("entity"."b" = :alias_1)
      const expectedQuery = '("entity"."a" = :alias_0) or ("entity"."b" = :alias_1)';
      expect(result.parsedFilter.query).toBe(expectedQuery);
      expect(result.parsedFilter.params).toEqual({ alias_0: 10, alias_1: 20 });
      expect(result.include).toEqual({});
    });
    it('should skip keys when the inner filter returns no where clause', () => {
      // Passing a value of undefined results in parseFilters skipping that key.
      const filtersObject = { a: undefined };
      const fieldName = 'field';
      const fieldAlias = 'alias';
      const result = service.parseInnerFilters(entityName, filtersObject, fieldName, fieldAlias);
      // Since the inner filter yields nothing, the loop is skipped and the query remains empty.
      expect(result.parsedFilter.query).toBe('');
      expect(result.parsedFilter.params).toEqual({});
      expect(result.include).toEqual({});
    });
    it('should detect allowed string operator keys and pass them as operator in inner parseFilters', () => {
      // Assume that SelectOperator.Like is part of the allowedStringOperators.
      // In this case the key itself ("like") should be used as the operator.
      const filtersObject = { [SelectOperator.Like]: 50 };
      const fieldName = 'field';
      const fieldAlias = 'alias';
      const result = service.parseInnerFilters(entityName, filtersObject, fieldName, fieldAlias);
      // Here, op becomes SelectOperator.Like.
      // The inner parseFilters is called with { field: 50 } using operator "like" and alias "alias_0".
      // Expected inner query: "entity"."field" like :alias_0
      expect(result.parsedFilter.query).toBe('"entity"."field" like :alias_0');
      expect(result.parsedFilter.params).toEqual({ alias_0: 50 });
      expect(result.include).toEqual({});
    });
  });

  describe('parseRelations', () => {
    // Use a minimal config with PG type so that the service is instantiated.
    const configProvider: ConfigProviderService = {
      [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
    } as unknown as ConfigProviderService;
    const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
    it('should return an empty object when include array is empty and no currentInclude provided', () => {
      const entityName = 'user';
      const include: string[] = [];
      const result = service.parseRelations(entityName, include);
      expect(result).toEqual({});
    });
    it('should correctly process a single-level relation', () => {
      const entityName = 'user';
      const include = ['profile'];
      const result = service.parseRelations(entityName, include);
      // Expected: "user.profile" becomes "user_profile"
      expect(result).toEqual({
        'user.profile': 'user_profile'
      });
    });
    it('should correctly process a nested relation', () => {
      const entityName = 'user';
      const include = ['address.city'];
      const result = service.parseRelations(entityName, include);
      // Expected:
      // 1st iteration: "user.address" -> "user_address"
      // 2nd iteration: "user_address.city" -> "user_address_city"
      expect(result).toEqual({
        'user.address': 'user_address',
        'user_address.city': 'user_address_city'
      });
    });
    it('should correctly merge currentInclude with new relations', () => {
      const entityName = 'user';
      const include = ['department'];
      const currentInclude = { 'user.role': 'user_role' };
      const result = service.parseRelations(entityName, include, currentInclude);
      // Expected to merge currentInclude with new relation:
      // "user.department" -> "user_department"
      expect(result).toEqual({
        'user.role': 'user_role',
        'user.department': 'user_department'
      });
    });
    it('should correctly process multiple include items', () => {
      const entityName = 'user';
      const include = ['profile', 'settings.preferences'];
      const result = service.parseRelations(entityName, include);
      // Expected:
      // For 'profile': "user.profile" -> "user_profile"
      // For 'settings.preferences': first "user.settings" -> "user_settings", then "user_settings.preferences" -> "user_settings_preferences"
      expect(result).toEqual({
        'user.profile': 'user_profile',
        'user.settings': 'user_settings',
        'user_settings.preferences': 'user_settings_preferences'
      });
    });
  });

  describe('parseOrderBy', () => {
    // Use a minimal config; the DB type is not used by parseOrderBy.
    const configProvider: ConfigProviderService = {
      [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
    } as unknown as ConfigProviderService;
    const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
    it('should return empty include and orderBy arrays for empty orderByData', () => {
      const entityName = 'user';
      const orderByData = {};
      const result = service.parseOrderBy(entityName, orderByData);
      expect(result.include).toEqual({});
      expect(result.orderBy).toEqual([]);
    });
    it('should handle a simple orderBy field with ASC direction', () => {
      const entityName = 'user';
      const orderByData = { id: 'asc' };
      const result = service.parseOrderBy(entityName, orderByData);
      expect(result.include).toEqual({});
      expect(result.orderBy).toEqual([{ field: 'user.id', direction: 'ASC' }]);
    });
    it('should handle a simple orderBy field with DESC direction', () => {
      const entityName = 'user';
      const orderByData = { createdAt: 'desc' };
      const result = service.parseOrderBy(entityName, orderByData);
      expect(result.include).toEqual({});
      expect(result.orderBy).toEqual([{ field: 'user.createdAt', direction: 'DESC' }]);
    });
    it('should handle orderBy for a relation field', () => {
      const entityName = 'user';
      const orderByData = { 'profile.name': 'desc' };
      const result = service.parseOrderBy(entityName, orderByData);
      // Expected relation alias: "user.profile" -> "user_profile"
      expect(result.include).toEqual({ 'user.profile': 'user_profile' });
      expect(result.orderBy).toEqual([{ field: 'user_profile.name', direction: 'DESC' }]);
    });
    it('should handle orderBy for nested relation fields', () => {
      const entityName = 'user';
      const orderByData = { 'address.city.name': 'asc' };
      const result = service.parseOrderBy(entityName, orderByData);
      // Expected processing:
      //  - "user.address" becomes "user_address"
      //  - "user_address.city" becomes "user_address_city"
      //  - Final field: "user_address_city.name"
      expect(result.include).toEqual({
        'user.address': 'user_address',
        'user_address.city': 'user_address_city'
      });
      expect(result.orderBy).toEqual([{ field: 'user_address_city.name', direction: 'ASC' }]);
    });
    it('should handle multiple orderBy entries', () => {
      const entityName = 'user';
      const orderByData = {
        id: 'desc',
        'profile.lastName': 'asc'
      };
      const result = service.parseOrderBy(entityName, orderByData);
      // Expected include: {"user.profile": "user_profile"}
      // OrderBy array: first for "id", then for "profile.lastName" -> "user_profile.lastName"
      expect(result.include).toEqual({ 'user.profile': 'user_profile' });
      expect(result.orderBy).toEqual([
        { field: 'user.id', direction: 'DESC' },
        { field: 'user_profile.lastName', direction: 'ASC' }
      ]);
    });
    it('should default direction to ASC for non-"desc" values', () => {
      const entityName = 'user';
      const orderByData = { email: 'whatever' };
      const result = service.parseOrderBy(entityName, orderByData);
      expect(result.include).toEqual({});
      expect(result.orderBy).toEqual([{ field: 'user.email', direction: 'ASC' }]);
    });
  });

  describe('parseSelect', () => {
    // Use a minimal config; the DB type isn't used by parseSelect.
    const configProvider: ConfigProviderService = {
      [Constants.SQL_BUILDER_DB_CONFIG_PATH]: { type: RDBType.PG }
    } as unknown as ConfigProviderService;
    const service = new SQLQueryBuilderService(configProvider, Constants.SQL_BUILDER_DB_CONFIG_PATH);
    it('should return an empty array when selectFields is empty', () => {
      const selectFields: string[] = [];
      const result = service.parseSelect(selectFields);
      expect(result).toEqual([]);
    });
    it('should return the same fields when no dot is present in any select field', () => {
      const selectFields = ['id', 'name', 'email'];
      const result = service.parseSelect(selectFields);
      expect(result).toEqual(['id', 'name', 'email']);
    });
    it('should return mapped select field for a relation when alias exists in include', () => {
      const selectFields = ['relation.field'];
      // Provide an include mapping for the relation.
      const include = { relation: 'alias1' };
      const result = service.parseSelect(selectFields, include);
      expect(result).toEqual(['alias1.field']);
    });
    it('should ignore select fields with dot notation when alias does not exist in include', () => {
      const selectFields = ['relation.field'];
      // Provide an empty include mapping.
      const result = service.parseSelect(selectFields, {});
      // Since no alias is provided for "relation", the field is skipped.
      expect(result).toEqual([]);
    });
    it('should process multiple select fields including both simple and relation fields', () => {
      const selectFields = ['id', 'profile.firstName', 'profile.lastName', 'status'];
      // The include mapping only contains an alias for "profile".
      const include = { profile: 'user_profile' };
      const result = service.parseSelect(selectFields, include);
      // Simple fields "id" and "status" are returned as-is.
      // Relation fields "profile.firstName" and "profile.lastName" are transformed to "user_profile.firstName" and "user_profile.lastName".
      expect(result).toEqual(['id', 'user_profile.firstName', 'user_profile.lastName', 'status']);
    });
  });
});
