import { ApplicationError, GenericObject, PersistanceFindResults, PersistanceSelectOperator } from '@node-c/core';
import { EntityManager, EntitySchema, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BulkCreateOptions,
  CountOptions,
  CreateOptions,
  FindOneOptions,
  FindOptions,
  PostgresErrorCode,
  RDBEntityService
} from './index';

import { IncludeItems, OrderBy, ParsedFilter, SQLQueryBuilderService } from '../sqlQueryBuilder';

class PostgresError extends Error {
  code: string;
  detail: string;
  table: string;
  constructor(message: string, data: { code: string; detail: string; table: string }) {
    super(message);
    for (const key in data) {
      this[key as keyof PostgresError] = data[key as keyof typeof data];
    }
  }
}
// Define a minimal test entity interface.
interface TestEntity {
  id: number;
  name: string;
}
interface TransactionManagerGetter {
  __getTransactionManager: () => EntityManager;
}
// Define a minimal dummy query builder interface.
interface QueryBuilderMock {
  execute?: () => Promise<{ affected?: number; raw?: TestEntity[] }>;
  delete?: () => QueryBuilderMock;
  getCount?: () => Promise<number>;
  getMany?: () => Promise<TestEntity[]>;
  getOne?: () => Promise<TestEntity | null>;
  returning?: (_columns: string) => QueryBuilderMock;
  set?: (_data: unknown) => QueryBuilderMock;
  skip?: (_value: number) => QueryBuilderMock;
  softDelete?: () => QueryBuilderMock;
  take?: (_value: number) => QueryBuilderMock;
  update?: () => QueryBuilderMock;
}
// Create a dummy SQLQueryBuilderService with only the needed methods.
const createQBMock = (): SQLQueryBuilderService =>
  ({
    columnQuotesSymbol: '"',
    buildQuery: vi.fn(),
    parseFilters: vi.fn().mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_tableName: string, _filters: unknown, _options: { operator: unknown; isTopLevel: boolean }) => {
        // Return dummy "where" and "include" objects.
        return {
          where: { dummy: 'filter' } as unknown as Record<string, ParsedFilter>,
          include: { dummyInclude: true }
        };
      }
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    parseOrderBy: vi.fn().mockImplementation((_tableName: string, _orderBy: unknown) => {
      // Return a dummy orderBy array.
      return { orderBy: [{ column: 'id', order: 'ASC' }] as unknown as OrderBy[] };
    }),
    parseRelations: vi
      .fn()
      .mockImplementation(
        (_tableName: string, _optRelations: unknown[], includeFromFilters: Record<string, unknown>) => {
          // Merge the include from filters with extra dummy data.
          return { ...includeFromFilters, extraRelation: true } as unknown as IncludeItems;
        }
      )
  }) as unknown as SQLQueryBuilderService;
// Create a dummy repository and transaction manager.
const createRepositoryMock = (qbm: QueryBuilderMock): Repository<TestEntity> => {
  const tmgm = createTransactionManagerMock(qbm);
  return {
    manager: {
      transaction: vi.fn().mockImplementation(async (cb: (_tm: EntityManager) => Promise<TestEntity | null>) => {
        return await cb(tmgm);
      })
    },
    metadata: { name: 'TestEntity', tableName: 'TestEntity' },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    target: 'TestEntity' as unknown as Function,
    __getTransactionManager: () => tmgm,
    createQueryBuilder: vi.fn().mockReturnValue(qbm)
  } as unknown as Repository<TestEntity>;
};
const createTransactionManagerMock = (qbm: QueryBuilderMock): EntityManager => {
  return {
    getRepository: vi.fn().mockImplementation(() => createRepositoryMock(qbm)),
    query: vi.fn().mockResolvedValue(undefined)
  } as unknown as EntityManager;
};
// We declare repositoryMock later since it needs the queryBuilderMock.
// A dummy query builder that simply returns a dummy entity.
const dummyEntity: TestEntity = { id: 1, name: 'Test' };
let queryBuilderMock: QueryBuilderMock;
let repositoryMock: Repository<TestEntity>;
let transactionManagerMock: EntityManager;

describe('RDBEntityService', () => {
  describe('constructor', () => {
    let qbMock: SQLQueryBuilderService;
    beforeEach(() => {
      qbMock = createQBMock();
      vi.clearAllMocks();
    });
    it('should correctly set primaryKeys when a single primary key is defined', () => {
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      const service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
      expect(service['primaryKeys']).toEqual(['id']);
    });
    it('should correctly set primaryKeys when multiple primary keys are defined', () => {
      interface CompositeEntity {
        id: number;
        code: string;
        value: number;
      }
      const dummySchemaMulti = new EntitySchema<CompositeEntity>({
        name: 'CompositeEntity',
        columns: {
          id: { type: Number, primary: true },
          code: { type: String, primary: true },
          value: { type: Number }
        }
      });
      const repositoryMulti = {
        metadata: { name: 'CompositeEntity', tableName: 'CompositeEntity' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        target: 'CompositeEntity' as unknown as Function,
        createQueryBuilder: vi.fn(),
        manager: { transaction: vi.fn() }
      } as unknown as Repository<CompositeEntity>;
      const serviceMulti = new RDBEntityService<CompositeEntity>(qbMock, repositoryMulti, dummySchemaMulti);
      expect(serviceMulti['primaryKeys']).toEqual(['id', 'code']);
    });
    it('should set primaryKeys to an empty array when no primary key is defined', () => {
      const dummySchemaNoPK = new EntitySchema<TestEntity>({
        name: 'NoPKEntity',
        columns: {
          id: { type: Number },
          name: { type: String }
        }
      });
      const repositoryNoPK = {
        metadata: { name: 'NoPKEntity', tableName: 'NoPKEntity' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        target: 'NoPKEntity' as unknown as Function,
        createQueryBuilder: vi.fn(),
        manager: { transaction: vi.fn() }
      } as unknown as Repository<TestEntity>;
      const serviceNoPK = new RDBEntityService<TestEntity>(qbMock, repositoryNoPK, dummySchemaNoPK);
      expect(serviceNoPK['primaryKeys']).toEqual([]);
    });
  });

  describe('buildPrimaryKeyWhereClause', () => {
    let qbMock: SQLQueryBuilderService;
    let service: RDBEntityService<TestEntity>;
    beforeEach(() => {
      // Reset mocks before each test.
      qbMock = createQBMock();
      queryBuilderMock = {
        getCount: vi.fn().mockResolvedValue(5),
        getOne: vi.fn().mockResolvedValue(dummyEntity)
      };
      // Create a repository mock that uses our dummy query builder.
      repositoryMock = createRepositoryMock(queryBuilderMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      // Create a dummy schema with one primary key ("id") and one extra column.
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
      // Clear mock history.
      vi.clearAllMocks();
    });
    it('should build correct clause for a single primary key', () => {
      const testData: TestEntity[] = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' }
      ];
      // Using the service from the earlier beforeEach (with single primary key "id")
      const result = service['buildPrimaryKeyWhereClause'](testData);
      expect(result.field).toBe('id');
      expect(result.value.params).toEqual({ id: [1, 2] });
      expect(result.value.query).toBe('"TestEntity"."id" in :id');
    });
    it('should build correct clause for composite primary keys', () => {
      interface CompositeEntity {
        id: number;
        code: string;
        value: number;
      }
      const compositeSchema = new EntitySchema<CompositeEntity>({
        name: 'CompositeEntity',
        columns: {
          id: { type: Number, primary: true },
          code: { type: String, primary: true },
          value: { type: Number }
        }
      });
      const compositeRepository = {
        metadata: { name: 'CompositeEntity', tableName: 'CompositeEntity' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        target: 'CompositeEntity' as unknown as Function,
        createQueryBuilder: vi.fn(),
        manager: { transaction: vi.fn() }
      } as unknown as Repository<CompositeEntity>;
      const compositeService = new RDBEntityService<CompositeEntity>(qbMock, compositeRepository, compositeSchema);
      const testData: CompositeEntity[] = [
        { id: 1, code: 'A', value: 100 },
        { id: 2, code: 'B', value: 200 }
      ];
      const result = compositeService['buildPrimaryKeyWhereClause'](testData);
      expect(result.field).toBe(PersistanceSelectOperator.Or);
      expect(result.value.params).toEqual({
        id0: 1,
        code0: 'A',
        id1: 2,
        code1: 'B'
      });
      const expectedQuery =
        '(("CompositeEntity"."id" = :id0 and "CompositeEntity"."code" = :code0) or ("CompositeEntity"."id" = :id1 and "CompositeEntity"."code" = :code1))';
      expect(result.value.query).toBe(expectedQuery);
    });
  });

  describe('bulkCreate', () => {
    let dummyEntities: TestEntity[];
    let qbMock: SQLQueryBuilderService;
    let service: RDBEntityService<TestEntity>;
    beforeEach(() => {
      qbMock = createQBMock();
      queryBuilderMock = {
        getCount: vi.fn().mockResolvedValue(5),
        getOne: vi.fn().mockResolvedValue(dummyEntity)
      };
      repositoryMock = createRepositoryMock(queryBuilderMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
      dummyEntities = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' }
      ];
    });
    it('should call save directly when transactionManager is provided', async () => {
      // Spy on the protected "save" method.
      const saveSpy = vi
        .spyOn(
          service as unknown as {
            save(_data: TestEntity[], _transactionManager?: EntityManager): Promise<TestEntity[]>;
          },
          'save'
        )
        .mockResolvedValue(dummyEntities);
      const options: BulkCreateOptions = { forceTransaction: false, transactionManager: transactionManagerMock };
      const result = await service.bulkCreate(dummyEntities, options);
      expect(result).toEqual(dummyEntities);
      expect(saveSpy).toHaveBeenCalledWith(dummyEntities, transactionManagerMock);
    });
    it('should use transaction when forceTransaction is true and transactionManager is not provided', async () => {
      // Spy on the protected "save" method.
      const saveSpy = vi
        .spyOn(
          service as unknown as {
            save(_data: TestEntity[], _transactionManager?: EntityManager): Promise<TestEntity[]>;
          },
          'save'
        )
        .mockResolvedValue(dummyEntities);
      // Prepare options without transactionManager and force a transaction.
      const options: BulkCreateOptions = { forceTransaction: true };
      const transactionSpy = repositoryMock.manager.transaction as ReturnType<typeof vi.fn>;
      const result = await service.bulkCreate(dummyEntities, options);
      expect(result).toEqual(dummyEntities);
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      // The inner call of bulkCreate (triggered by the transaction) should call save with the provided transactionManager.
      expect(saveSpy).toHaveBeenCalledWith(dummyEntities, transactionManagerMock);
    });
  });

  describe('create', () => {
    let dummyEntity: TestEntity;
    let qbMock: SQLQueryBuilderService;
    let service: RDBEntityService<TestEntity>;
    beforeEach(() => {
      qbMock = createQBMock();
      queryBuilderMock = {
        getCount: vi.fn().mockResolvedValue(5),
        getOne: vi.fn().mockResolvedValue(dummyEntity)
      };
      repositoryMock = createRepositoryMock(queryBuilderMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: { id: { type: Number, primary: true }, name: { type: String } }
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
      dummyEntity = { id: 1, name: 'Test' };
    });
    it('should call save and return the entity when transactionManager is provided', async () => {
      const saveSpy = vi
        .spyOn(
          service as unknown as { save(_data: TestEntity, _transactionManager?: EntityManager): Promise<TestEntity> },
          'save'
        )
        .mockResolvedValue(dummyEntity);
      const options: CreateOptions = { forceTransaction: false, transactionManager: transactionManagerMock };
      const result = await service.create(dummyEntity, options);
      expect(result).toEqual(dummyEntity);
      expect(saveSpy).toHaveBeenCalledWith(dummyEntity, transactionManagerMock);
    });
    it('should use transaction when forceTransaction is true and no transactionManager is provided', async () => {
      const saveSpy = vi
        .spyOn(
          service as unknown as { save(_data: TestEntity, _transactionManager?: EntityManager): Promise<TestEntity> },
          'save'
        )
        .mockResolvedValue(dummyEntity);
      const options: CreateOptions = { forceTransaction: true };
      const transactionSpy = repositoryMock.manager.transaction as ReturnType<typeof vi.fn>;
      const result = await service.create(dummyEntity, options);
      expect(result).toEqual(dummyEntity);
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(dummyEntity, transactionManagerMock);
    });
    it('should throw ApplicationError with specific message when unique violation occurs with matching regex', async () => {
      const saveSpy = vi
        .spyOn(
          service as unknown as { save(_data: TestEntity, _transactionManager?: EntityManager): Promise<TestEntity> },
          'save'
        )
        .mockImplementation(() => {
          throw new PostgresError('err', {
            code: PostgresErrorCode.UniqueViolation,
            detail: 'Key (name)=Test',
            table: 'TestEntity'
          });
        });
      const options: CreateOptions = { forceTransaction: false, transactionManager: transactionManagerMock };
      await expect(service.create(dummyEntity, options)).rejects.toEqual(
        new ApplicationError('TestEntity: name needs to be unique')
      );
      expect(saveSpy).toHaveBeenCalledWith(dummyEntity, transactionManagerMock);
    });
    it('should throw ApplicationError with default message when unique violation occurs with non matching detail', async () => {
      const errorObj = {
        code: PostgresErrorCode.UniqueViolation,
        detail: 'Non matching detail',
        table: 'TestEntity'
      };
      const saveSpy = vi
        .spyOn(
          service as unknown as { save(_data: TestEntity, _transactionManager?: EntityManager): Promise<TestEntity> },
          'save'
        )
        .mockRejectedValue(errorObj);
      const options: CreateOptions = { forceTransaction: false, transactionManager: transactionManagerMock };
      await expect(service.create(dummyEntity, options)).rejects.toEqual(
        new ApplicationError('TestEntity: a column value you have provided needs to be unique')
      );
      expect(saveSpy).toHaveBeenCalledWith(dummyEntity, transactionManagerMock);
    });
    it('should rethrow error if error code is not UniqueViolation', async () => {
      const errorObj = {
        code: 'SomeOtherError',
        message: 'Error occurred'
      };
      const saveSpy = vi
        .spyOn(
          service as unknown as { save(_data: TestEntity, _transactionManager?: EntityManager): Promise<TestEntity> },
          'save'
        )
        .mockRejectedValue(errorObj);
      const options: CreateOptions = { forceTransaction: false, transactionManager: transactionManagerMock };
      await expect(service.create(dummyEntity, options)).rejects.toEqual(errorObj);
      expect(saveSpy).toHaveBeenCalledWith(dummyEntity, transactionManagerMock);
    });
  });

  describe('count', () => {
    let qbMock: SQLQueryBuilderService;
    let queryBuilderCountMock: QueryBuilderMock;
    let service: RDBEntityService<TestEntity>;
    beforeEach(() => {
      // Create a qbMock with our dummy implementations.
      qbMock = createQBMock();
      // Create a dummy query builder for count that implements getCount.
      queryBuilderCountMock = {
        getCount: vi.fn().mockResolvedValue(5),
        getOne: vi.fn().mockResolvedValue(dummyEntity)
      };
      // Create a repository mock that returns our count query builder.
      repositoryMock = createRepositoryMock(queryBuilderCountMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      // Build a dummy schema with a single primary key.
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
    });
    it('should return count when transactionManager is provided', async () => {
      const options: CountOptions = {
        filters: { id: 1 },
        forceTransaction: false,
        transactionManager: transactionManagerMock,
        withDeleted: true
      };
      const count = await service.count(options);
      expect(count).toEqual(5);
      // Verify that parseFilters was called with correct arguments.
      expect(qbMock.parseFilters).toHaveBeenCalledWith('TestEntity', options.filters);
      // Verify that parseRelations is called.
      expect(qbMock.parseRelations).toHaveBeenCalledWith('TestEntity', [], { dummyInclude: true });
      // Verify that buildQuery is called with the proper parameters.
      expect(qbMock.buildQuery).toHaveBeenCalledTimes(1);
    });
    it('should use a transaction when forceTransaction is true and transactionManager is not provided', async () => {
      const transactionSpy = vi.spyOn(repositoryMock.manager, 'transaction');
      const options: CountOptions = {
        filters: { id: 1 },
        forceTransaction: true,
        withDeleted: false
      };
      const count = await service.count(options);
      expect(count).toEqual(5);
      expect(transactionSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    const dummyFilters = { id: 1 };
    let qbMock: SQLQueryBuilderService;
    let deleteQueryBuilderMock: QueryBuilderMock;
    let dummySchema: EntitySchema<TestEntity>;
    let service: RDBEntityService<TestEntity>;
    beforeEach(() => {
      qbMock = createQBMock();
      dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      // Create a dummy query builder with only an execute method.
      deleteQueryBuilderMock = {
        delete: vi.fn().mockReturnThis(),
        execute: vi.fn(),
        getMany: vi.fn().mockResolvedValue([]),
        returning: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        softDelete: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis()
      };
      repositoryMock = createRepositoryMock(deleteQueryBuilderMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
    });
    it('should use a transaction when forceTransaction is true and no transactionManager is provided', async () => {
      const options = { filters: dummyFilters, forceTransaction: true, softDelete: true };
      // Stub parseFilters to return a dummy where clause with an empty include.
      vi.spyOn(qbMock, 'parseFilters').mockReturnValue({
        where: { dummy: { params: { a: 1 }, query: 'dummyQuery' } },
        include: {}
      });
      // Stub buildQuery as no-op.
      vi.spyOn(qbMock, 'buildQuery').mockImplementation(() => {});
      (deleteQueryBuilderMock.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ affected: 2 });
      const result = await service.delete(options);
      expect(repositoryMock.manager.transaction).toHaveBeenCalled();
      expect(result).toEqual({ count: 2 });
    });
    it('should delete using softDelete when include is empty', async () => {
      const options = {
        filters: dummyFilters,
        forceTransaction: false,
        softDelete: true,
        transactionManager: transactionManagerMock
      };
      // Stub parseFilters to return an empty include.
      vi.spyOn(qbMock, 'parseFilters').mockReturnValue({
        where: { dummy: { params: { a: 1 }, query: 'dummyQuery' } },
        include: {}
      });
      vi.spyOn(qbMock, 'buildQuery').mockImplementation(() => {});
      (deleteQueryBuilderMock.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ affected: 3 });
      const result = await service.delete(options);
      expect(qbMock.parseFilters).toHaveBeenCalledWith('TestEntity', dummyFilters);
      expect(qbMock.buildQuery).toHaveBeenCalledWith(deleteQueryBuilderMock, {
        where: { dummy: { params: { a: 1 }, query: 'dummyQuery' } }
      });
      expect(result).toEqual({ count: 3 });
    });
    it('should delete using hard delete when softDelete is false and include is empty', async () => {
      const options = {
        filters: dummyFilters,
        forceTransaction: false,
        softDelete: false,
        transactionManager: transactionManagerMock
      };
      vi.spyOn(qbMock, 'parseFilters').mockReturnValue({
        where: { dummy: { params: { a: 2 }, query: 'dummyQuery2' } },
        include: {}
      });
      vi.spyOn(qbMock, 'buildQuery').mockImplementation(() => {});
      (deleteQueryBuilderMock.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ affected: 4 });
      const result = await service.delete(options);
      expect(qbMock.buildQuery).toHaveBeenCalledWith(deleteQueryBuilderMock, {
        where: { dummy: { params: { a: 2 }, query: 'dummyQuery2' } }
      });
      expect(result).toEqual({ count: 4 });
    });
    it('should delete using include branch when include is not empty', async () => {
      const options = {
        filters: dummyFilters,
        forceTransaction: false,
        softDelete: true,
        transactionManager: transactionManagerMock
      };
      // Stub parseFilters to return a non-empty include.
      vi.spyOn(qbMock, 'parseFilters').mockReturnValue({
        where: { dummy: { params: { a: 3 }, query: 'dummyQuery3' } },
        include: { relation: 'relationName' }
      });
      // Stub the find method to return a dummy find result.
      const findResult = { items: [{ id: 1, name: 'Test' }] };
      const findSpy = vi.spyOn(service, 'find').mockResolvedValue(findResult as PersistanceFindResults<TestEntity>);
      vi.spyOn(qbMock, 'buildQuery').mockImplementation(() => {});
      (deleteQueryBuilderMock.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ affected: 5 });
      // The expected where clause is produced by buildPrimaryKeyWhereClause.
      // For a single primary key "id", it should be:
      // { field: "id", value: { params: { id: [1] }, query: `"TestEntity"."id" in :id` } }
      const expectedPKClause = { field: 'id', value: { params: { id: [1] }, query: '"TestEntity"."id" in :id' } };
      const result = await service.delete(options);
      expect(findSpy).toHaveBeenCalledWith({ filters: dummyFilters, transactionManager: transactionManagerMock });
      expect(qbMock.buildQuery).toHaveBeenCalledWith(deleteQueryBuilderMock, {
        where: { [expectedPKClause.field]: expectedPKClause.value }
      });
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('find', () => {
    let findQueryBuilderMock: QueryBuilderMock;
    let service: RDBEntityService<TestEntity>;
    let qbMock: SQLQueryBuilderService;
    beforeEach(() => {
      qbMock = createQBMock();
      // Create a dummy query builder that simulates chainable skip and take, and a getMany method.
      findQueryBuilderMock = {
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([])
      };
      repositoryMock = createRepositoryMock(findQueryBuilderMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
    });
    it('should return paginated results with "more" flag true when items length equals perPage+1', async () => {
      // If perPage is 2, then perPage + 1 is 3.
      const dummyItems: TestEntity[] = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' }
      ];
      findQueryBuilderMock.getMany = vi.fn().mockResolvedValue(dummyItems);
      const options = {
        filters: { name: 'test' },
        forceTransaction: false,
        page: 1,
        perPage: 2,
        findAll: false,
        transactionManager: transactionManagerMock,
        withDeleted: false
      };
      const results = await service.find(options);
      // With page=1 and perPage=2, skip should be called with 0 and take with 3.
      expect(findQueryBuilderMock.skip).toHaveBeenCalledWith(0);
      expect(findQueryBuilderMock.take).toHaveBeenCalledWith(2 + 1);
      // The service should pop the extra item and set "more" to true.
      expect(results.page).toBe(1);
      expect(results.perPage).toBe(2);
      expect(results.more).toBe(true);
      expect(results.items).toEqual(dummyItems.slice(0, 2));
    });
    it('should return paginated results with "more" flag false when items length is less than perPage+1', async () => {
      const dummyItems: TestEntity[] = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' }
      ];
      findQueryBuilderMock.getMany = vi.fn().mockResolvedValue(dummyItems);
      const options = {
        filters: { name: 'test' },
        forceTransaction: false,
        page: 1,
        perPage: 2,
        findAll: false,
        transactionManager: transactionManagerMock,
        withDeleted: false
      };
      const results = await service.find(options);
      expect(findQueryBuilderMock.skip).toHaveBeenCalledWith(0);
      expect(findQueryBuilderMock.take).toHaveBeenCalledWith(3);
      expect(results.page).toBe(1);
      expect(results.perPage).toBe(2);
      expect(results.more).toBe(false);
      expect(results.items).toEqual(dummyItems);
    });
    it('should process orderBy option if provided', async () => {
      // Prepare dummy items to be returned by getMany.
      const dummyItems: TestEntity[] = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' }
      ];
      // Simulate getMany returning our dummy items.
      findQueryBuilderMock.getMany = vi.fn().mockResolvedValue(dummyItems);
      // Create a fake orderBy data to be returned by parseOrderBy.
      const orderByData = {
        orderBy: [{ column: 'id', order: 'DESC' }] as unknown as OrderBy[],
        include: { extraOrder: true } as unknown as IncludeItems
      };
      const parseOrderBySpy = vi.spyOn(qbMock, 'parseOrderBy').mockReturnValue(orderByData);
      const options = {
        filters: { name: 'test' },
        forceTransaction: false,
        page: 1,
        perPage: 10,
        findAll: false,
        transactionManager: transactionManagerMock,
        withDeleted: false,
        orderBy: 'id_DESC'
      };
      const results = await service.find(options as unknown as FindOptions);
      // Verify that parseOrderBy was called with the proper table name and orderBy value.
      expect(parseOrderBySpy).toHaveBeenCalledWith('TestEntity', 'id_DESC');
      // Verify that the overall include contains the extra include from orderBy.
      // Also, check that qbMock.buildQuery was called with the orderBy array from orderByData.
      expect(qbMock.buildQuery).toHaveBeenCalledWith(
        findQueryBuilderMock,
        expect.objectContaining({
          orderBy: orderByData.orderBy
        })
      );
      // Confirm the results remain consistent with pagination.
      expect(results.page).toBe(1);
      expect(results.perPage).toBe(10);
      expect(results.items).toEqual(dummyItems);
    });
    it('should return all results when findAll is true and not call skip/take', async () => {
      const dummyItems: TestEntity[] = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' }
      ];
      findQueryBuilderMock.getMany = vi.fn().mockResolvedValue(dummyItems);
      const options = {
        filters: { name: 'test' },
        forceTransaction: false,
        page: 1,
        perPage: 2,
        findAll: true,
        transactionManager: transactionManagerMock,
        withDeleted: false
      };
      const results = await service.find(options);
      // In the "findAll" branch, skip() and take() should not be called.
      expect(findQueryBuilderMock.skip).not.toHaveBeenCalled();
      expect(findQueryBuilderMock.take).not.toHaveBeenCalled();
      // findResults.perPage is set to the length of the returned items.
      expect(results.page).toBe(1);
      expect(results.perPage).toBe(dummyItems.length);
      expect(results.more).toBe(false);
      expect(results.items).toEqual(dummyItems);
    });
    it('should parse page and perPage as numbers when provided as strings', async () => {
      const dummyItems: TestEntity[] = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' }
      ];
      findQueryBuilderMock.getMany = vi.fn().mockResolvedValue(dummyItems);
      const options = {
        filters: { name: 'test' },
        forceTransaction: false,
        page: '2', // provided as string
        perPage: '2', // provided as string
        findAll: false,
        transactionManager: transactionManagerMock,
        withDeleted: false
      };
      const results = await service.find(options as unknown as FindOptions);
      // For page "2" and perPage "2": skip = (2 - 1) * 2 = 2, take = 3.
      expect(findQueryBuilderMock.skip).toHaveBeenCalledWith(2);
      expect(findQueryBuilderMock.take).toHaveBeenCalledWith(2 + 1);
      expect(results.page).toBe(2);
      expect(results.perPage).toBe(2);
    });
    it('should use a transaction when forceTransaction is true and no transactionManager is provided', async () => {
      const transactionSpy = vi.spyOn(repositoryMock.manager, 'transaction');
      // For this branch, simulate getMany returning an empty array.
      findQueryBuilderMock.getMany = vi.fn().mockResolvedValue([]);
      const options = {
        filters: { name: 'test' },
        forceTransaction: true,
        page: 1,
        perPage: 2,
        findAll: false,
        withDeleted: false
      };
      const results = await service.find(options);
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      expect(results.items).toEqual([]);
      expect(results.page).toEqual(1);
      expect(results.perPage).toEqual(2);
    });
  });

  describe('findOne', () => {
    let qbMock: SQLQueryBuilderService;
    let service: RDBEntityService<TestEntity>;
    beforeEach(() => {
      // Reset mocks before each test.
      qbMock = createQBMock();
      // Create a repository mock that uses our dummy query builder.
      repositoryMock = createRepositoryMock(queryBuilderMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      // Create a dummy schema with one primary key ("id") and one extra column.
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
      // Clear mock history.
      vi.clearAllMocks();
    });
    it('should return the entity when found without forceTransaction and without orderBy', async () => {
      const options: FindOneOptions = {
        filters: { id: 1 },
        forceTransaction: false,
        transactionManager: transactionManagerMock,
        withDeleted: false
      };
      const result = await service.findOne(options);
      expect(result).toEqual(dummyEntity);
      // Verify that parseFilters was called with the correct arguments.
      expect(qbMock.parseFilters).toHaveBeenCalledWith('TestEntity', options.filters, {
        operator: undefined,
        isTopLevel: true
      });
      // When no relations are passed, the optRelations defaults to an empty array.
      expect(qbMock.parseRelations).toHaveBeenCalledWith('TestEntity', [], { dummyInclude: true });
      // Since no orderBy option is provided, the orderBy array should be empty.
      expect(qbMock.buildQuery).toHaveBeenCalledWith(queryBuilderMock, {
        where: { dummy: 'filter' },
        include: { dummyInclude: true, extraRelation: true },
        orderBy: [],
        withDeleted: false
      });
    });
    it('should return the entity when found with orderBy provided', async () => {
      const options: FindOneOptions = {
        filters: { id: 1 },
        forceTransaction: false,
        transactionManager: transactionManagerMock,
        orderBy: 'id_ASC' as unknown as GenericObject<string>,
        withDeleted: true
      };
      const result = await service.findOne(options);
      expect(result).toEqual(dummyEntity);
      expect(qbMock.parseFilters).toHaveBeenCalledWith('TestEntity', options.filters, {
        operator: undefined,
        isTopLevel: true
      });
      expect(qbMock.parseRelations).toHaveBeenCalledWith('TestEntity', [], { dummyInclude: true });
      expect(qbMock.parseOrderBy).toHaveBeenCalledWith('TestEntity', options.orderBy);
      expect(qbMock.buildQuery).toHaveBeenCalledWith(queryBuilderMock, {
        where: { dummy: 'filter' },
        include: { dummyInclude: true, extraRelation: true },
        orderBy: [{ column: 'id', order: 'ASC' }],
        withDeleted: true
      });
    });
    it('should pass selectOperator to parseFilters if provided', async () => {
      // Here we cast the string to unknown and then to the expected type.
      const options: FindOneOptions = {
        filters: { id: 1 },
        forceTransaction: false,
        transactionManager: transactionManagerMock,
        selectOperator: 'customOperator' as unknown as FindOneOptions['selectOperator'],
        withDeleted: false
      };
      const result = await service.findOne(options);
      expect(result).toEqual(dummyEntity);
      expect(qbMock.parseFilters).toHaveBeenCalledWith('TestEntity', options.filters, {
        operator: 'customOperator',
        isTopLevel: true
      });
    });
    it('should use a transaction when forceTransaction is true and transactionManager is not provided', async () => {
      const options: FindOneOptions = {
        filters: { id: 1 },
        forceTransaction: true,
        withDeleted: false
      };
      const result = await service.findOne(options);
      expect(result).toEqual(dummyEntity);
      expect(repositoryMock.manager.transaction).toHaveBeenCalledTimes(1);
      // qb.buildQuery should be called in the recursive call.
      expect(qbMock.buildQuery).toHaveBeenCalled();
    });
  });

  describe('getEntityTarget', () => {
    it('should return the repository target', () => {
      const qbMock = createQBMock();
      // Create a dummy entity target (can be a function or string)
      const dummyTarget = 'TestEntityTarget';
      // Create a dummy schema for our test entity.
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      // Create a dummy repository that includes the target.
      const repositoryForTarget = {
        metadata: { name: 'TestEntity', tableName: 'TestEntity' },
        target: dummyTarget,
        createQueryBuilder: vi.fn(),
        manager: { transaction: vi.fn() }
      } as unknown as Repository<TestEntity>;
      // Instantiate the service with the dummy repository.
      const service = new RDBEntityService<TestEntity>(qbMock, repositoryForTarget, dummySchema);
      // Verify that getEntityTarget returns the repository's target.
      expect(service.getEntityTarget()).toEqual(dummyTarget);
    });
  });

  describe('getRepository', () => {
    let qbMock: SQLQueryBuilderService;
    let repositoryForTest: Repository<TestEntity>;
    let service: RDBEntityService<TestEntity>;
    beforeEach(() => {
      qbMock = createQBMock();
      // Create a dummy repository with a target.
      repositoryForTest = {
        metadata: { name: 'TestEntity', tableName: 'TestEntity' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        target: 'TestEntityTarget' as unknown as Function,
        createQueryBuilder: vi.fn(),
        manager: { transaction: vi.fn() }
      } as unknown as Repository<TestEntity>;
      const dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryForTest, dummySchema);
    });
    it('should return the repository when no transactionManager is provided', () => {
      const result = service['getRepository']();
      expect(result).toEqual(repositoryForTest);
    });
    it('should return the repository from the transactionManager when provided', () => {
      const dummyRepoFromTM = { ...repositoryForTest, extraProp: 'dummy' };
      const transactionManager: EntityManager = {
        getRepository: vi.fn().mockReturnValue(dummyRepoFromTM)
      } as unknown as EntityManager;
      const result = service['getRepository'](transactionManager);
      expect(transactionManager.getRepository).toHaveBeenCalledWith(repositoryForTest.target);
      expect(result).toEqual(dummyRepoFromTM);
    });
  });

  describe('processManyToMany', () => {
    let qbMock: SQLQueryBuilderService;
    let service: RDBEntityService<TestEntity>;
    // Use a simple dummy schema; the entity type details are not important for this test.
    const dummySchema = new EntitySchema<TestEntity>({
      name: 'TestEntity',
      columns: {
        id: { type: Number, primary: true },
        name: { type: String }
      }
    });
    beforeEach(() => {
      // Create a qbMock with a defined columnQuotesSymbol.
      qbMock = createQBMock();
      qbMock.columnQuotesSymbol = '"';
      // Create a dummy repository (its methods won't be used except for transaction handling).
      // repositoryMock = createRepositoryMock({} as FindQueryBuilderMock, 'TestEntity');
      repositoryMock = createRepositoryMock(queryBuilderMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      // Instantiate the service.
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
    });
    it('should use a transaction when no transactionManager is provided', async () => {
      // Create a fake transaction manager with a spy on the query method.
      const data = {
        counterpartColumn: 'counterpart',
        currentEntityColumn: 'current',
        id: 42,
        tableName: 'TestTable',
        items: [] // no items
      };
      await service['processManyToMany'](data);
      expect(repositoryMock.manager.transaction).toHaveBeenCalledTimes(1);
      // With no items, no query should be executed.
      expect(transactionManagerMock.query).not.toHaveBeenCalled();
    });
    it('should execute both delete and insert queries for mixed items', async () => {
      const data = {
        counterpartColumn: 'counterpart',
        currentEntityColumn: 'current',
        id: 42,
        tableName: 'TestTable',
        items: [
          { deleted: true, value: 10 },
          { deleted: false, value: 20 }
        ]
      };
      await service['processManyToMany'](data, { transactionManager: transactionManagerMock });
      // Expected delete query:
      // Initially: deleteQuery = `delete from "TestTable" where `
      // After first (deleted) item: becomes `delete from "TestTable" where ("current" = 42 and "counterpart" = 10)`
      const expectedDeleteQuery = 'delete from "TestTable" where ("current" = 42 and "counterpart" = 10)';
      // Expected insert query:
      // insertQuery = `insert into "TestTable" ("current", "counterpart") values (42, 20) on conflict do nothing`
      const expectedInsertQuery =
        'insert into "TestTable" ("current", "counterpart") values (42, 20) on conflict do nothing';
      // Expect query to be called twice in order: first delete then insert.
      expect(transactionManagerMock.query).toHaveBeenNthCalledWith(1, expectedDeleteQuery);
      expect(transactionManagerMock.query).toHaveBeenNthCalledWith(2, expectedInsertQuery);
    });
    it('should execute only a delete query when all items are deleted', async () => {
      const data = {
        counterpartColumn: 'counterpart',
        currentEntityColumn: 'current',
        id: 42,
        tableName: 'TestTable',
        items: [
          { deleted: true, value: 10 },
          { deleted: true, value: 15 }
        ]
      };
      await service['processManyToMany'](data, { transactionManager: transactionManagerMock });
      // Expected delete query:
      // After first item: `delete from "TestTable" where ("current" = 42 and "counterpart" = 10)`
      // After second item: appended with ` or ("current" = 42 and "counterpart" = 15)`
      const expectedDeleteQuery =
        'delete from "TestTable" where ("current" = 42 and "counterpart" = 10) or ("current" = 42 and "counterpart" = 15)';
      expect(transactionManagerMock.query).toHaveBeenCalledTimes(1);
      expect(transactionManagerMock.query).toHaveBeenCalledWith(expectedDeleteQuery);
    });
    it('should execute only an insert query when all items are not deleted', async () => {
      const data = {
        counterpartColumn: 'counterpart',
        currentEntityColumn: 'current',
        id: 42,
        tableName: 'TestTable',
        items: [
          { deleted: false, value: 20 },
          { deleted: false, value: 30 }
        ]
      };
      await service['processManyToMany'](data, { transactionManager: transactionManagerMock });
      // Expected insert query:
      // For first item: `insert into "TestTable" ("current", "counterpart") values (42, 20)`
      // For second item: appended with `, (42, 30)`
      // Final query with on conflict clause:
      const expectedInsertQuery =
        'insert into "TestTable" ("current", "counterpart") values (42, 20), (42, 30) on conflict do nothing';
      expect(transactionManagerMock.query).toHaveBeenCalledTimes(1);
      expect(transactionManagerMock.query).toHaveBeenCalledWith(expectedInsertQuery);
    });
    it('should not execute any queries when items array is empty', async () => {
      const data = {
        counterpartColumn: 'counterpart',
        currentEntityColumn: 'current',
        id: 42,
        tableName: 'TestTable',
        items: [] as { deleted: boolean; value: number }[]
      };
      await service['processManyToMany'](data, { transactionManager: transactionManagerMock });
      expect(transactionManagerMock.query).not.toHaveBeenCalled();
    });
  });

  describe('save', () => {
    let dummyData: TestEntity;
    let dummySchema: EntitySchema<TestEntity>;
    let qbMock: SQLQueryBuilderService;
    let repositoryForSave: Repository<TestEntity>;
    let service: RDBEntityService<TestEntity>;
    beforeEach(() => {
      qbMock = createQBMock();
      dummyData = { id: 1, name: 'Test' };
      // Create a dummy repository that includes a save method.
      repositoryForSave = {
        metadata: { name: 'TestEntity', tableName: 'TestEntity' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        target: 'TestEntityTarget' as unknown as Function,
        save: vi.fn().mockResolvedValue(dummyData),
        createQueryBuilder: vi.fn(),
        manager: { transaction: vi.fn() }
      } as unknown as Repository<TestEntity>;
      dummySchema = new EntitySchema<TestEntity>({
        name: 'TestEntity',
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        }
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryForSave, dummySchema);
    });
    it('should call transactionManager.save when transactionManager is provided', async () => {
      // Create a dummy transaction manager with a save method.
      const tmSaveSpy = vi.fn().mockResolvedValue(dummyData);
      const dummyTransactionManager: EntityManager = { save: tmSaveSpy } as unknown as EntityManager;
      const result = await service['save'](dummyData, dummyTransactionManager);
      expect(tmSaveSpy).toHaveBeenCalledWith(repositoryForSave.target, dummyData);
      expect(result).toEqual(dummyData);
    });
    it('should call repository.save when no transactionManager is provided', async () => {
      const repoSaveSpy = repositoryForSave.save as ReturnType<typeof vi.fn>;
      const result = await service['save'](dummyData);
      expect(repoSaveSpy).toHaveBeenCalledWith(dummyData);
      expect(result).toEqual(dummyData);
    });
  });

  describe('update', () => {
    let dummySchema: EntitySchema<TestEntity>;
    let dummyEntity: TestEntity;
    let qbMock: SQLQueryBuilderService;
    let service: RDBEntityService<TestEntity>;
    let updateQueryBuilderMock: QueryBuilderMock;
    beforeEach(() => {
      qbMock = createQBMock();
      updateQueryBuilderMock = {
        execute: vi.fn(),
        getMany: vi.fn().mockResolvedValue([]),
        returning: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis()
      };
      repositoryMock = createRepositoryMock(updateQueryBuilderMock);
      transactionManagerMock = (repositoryMock as unknown as TransactionManagerGetter).__getTransactionManager();
      dummyEntity = { id: 1, name: 'Test' };
      dummySchema = new EntitySchema<TestEntity>({
        columns: {
          id: { type: Number, primary: true },
          name: { type: String }
        },
        name: 'TestEntity'
      });
      service = new RDBEntityService<TestEntity>(qbMock, repositoryMock, dummySchema);
      vi.clearAllMocks();
    });
    it('should use a transaction when forceTransaction is true and no transactionManager is provided', async () => {
      (updateQueryBuilderMock.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ affected: 1 });
      const options = { filters: { name: 'Test' }, forceTransaction: true, returnData: false };
      const result = await service.update(dummyEntity, options);
      expect(repositoryMock.manager.transaction).toHaveBeenCalled();
      expect(result).toEqual({ count: 1 });
    });
    it('should update and return count when returnData is false and no include is returned', async () => {
      const parsedWhere = { dummy: { params: { a: 1 }, query: 'dummy' } };
      vi.spyOn(qbMock, 'buildQuery').mockImplementation(() => {});
      vi.spyOn(qbMock, 'parseFilters').mockReturnValue({ where: parsedWhere, include: {} });
      (updateQueryBuilderMock.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ affected: 2 });
      const options = {
        filters: { name: 'Test' },
        forceTransaction: false,
        returnData: false,
        transactionManager: transactionManagerMock
      };
      const result = await service.update(dummyEntity, options);
      expect(qbMock.parseFilters).toHaveBeenCalledWith('TestEntity', { name: 'Test' });
      expect(qbMock.buildQuery).toHaveBeenCalledWith(updateQueryBuilderMock, { where: parsedWhere });
      expect(result).toEqual({ count: 2 });
    });
    it('should update and return data when returnData is true', async () => {
      const parsedWhere = { dummy: { params: { a: 1 }, query: 'dummy' } };
      vi.spyOn(qbMock, 'buildQuery').mockImplementation(() => {});
      vi.spyOn(qbMock, 'parseFilters').mockReturnValue({ where: parsedWhere, include: {} });
      // Simulate the returning branch.
      (updateQueryBuilderMock.returning as ReturnType<typeof vi.fn>).mockReturnThis();
      const fakeRaw: TestEntity[] = [dummyEntity];
      (updateQueryBuilderMock.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ raw: fakeRaw });
      const options = {
        filters: { name: 'Test' },
        forceTransaction: false,
        returnData: true,
        transactionManager: transactionManagerMock
      };
      const result = await service.update(dummyEntity, options);
      expect(qbMock.buildQuery).toHaveBeenCalledWith(updateQueryBuilderMock, { where: parsedWhere });
      expect(result).toEqual({ items: fakeRaw });
    });
    it('should update using include branch by calling find and buildPrimaryKeyWhereClause', async () => {
      // Simulate a non-empty include.
      const includeObj = { related: true };
      const parsedWhere = { dummy: { params: { a: 1 }, query: 'dummy' } };
      vi.spyOn(qbMock, 'parseFilters').mockReturnValue({
        where: parsedWhere,
        include: includeObj as unknown as IncludeItems
      });
      // Stub the find method to return a dummy result.
      const findResult = { items: [dummyEntity] };
      vi.spyOn(service, 'find').mockResolvedValue(findResult as unknown as PersistanceFindResults<TestEntity>);
      vi.spyOn(qbMock, 'buildQuery').mockImplementation(() => {});
      (updateQueryBuilderMock.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ affected: 3 });
      const options = {
        filters: { name: 'Test' },
        forceTransaction: false,
        returnData: false,
        transactionManager: transactionManagerMock
      };
      const result = await service.update(dummyEntity, options);
      // Use the actual buildPrimaryKeyWhereClause to compute expected where clause.
      const expectedPKClause = service['buildPrimaryKeyWhereClause'](findResult.items);
      const expectedWhere = { [expectedPKClause.field]: expectedPKClause.value };
      expect(qbMock.buildQuery).toHaveBeenCalledWith(updateQueryBuilderMock, { where: expectedWhere });
      expect(result).toEqual({ count: 3 });
    });
  });
});
