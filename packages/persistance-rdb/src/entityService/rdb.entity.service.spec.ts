import { Injectable } from '@nestjs/common';

import { ConfigProviderService, RDBType, SelectOperator } from '@node-c/core';

import {
  DeleteResult,
  EntityManager,
  EntityMetadata,
  EntitySchema,
  FindOneOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  UpdateResult
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BulkCreateOptions,
  CountOptions,
  CreateOptions,
  RDBEntityService,
  FindOptions as RDBFindOptions
} from './index';

import { ParsedFilter } from '../sqlQueryBuilder/sqlQueryBuilder.definitions';
import { SQLQueryBuilderService } from '../sqlQueryBuilder/sqlQueryBuilder.service';

// Minimal ConfigProviderService implementation.
@Injectable()
class DummyConfigProviderService {
  config = {
    domain: { projectName: 'testProject', projectRootPath: '' },
    general: {},
    persistance: {
      dummy: { type: RDBType.MySQL }
    }
  };
}
const configProvider = new DummyConfigProviderService();
const dummyDbConfigPath = 'config.persistance.dummy';
const realSQLQueryBuilderService = new SQLQueryBuilderService(
  configProvider as unknown as ConfigProviderService,
  dummyDbConfigPath
);
// ----- Dummy implementations for Repository -----
// Define a dummy entity interface.
interface DummyEntity extends ObjectLiteral {
  id: number;
  name?: string;
}
// Create a dummy query builder
class DummyDeleteQueryBuilder {
  params: Record<string, unknown>;
  execute = vi.fn(() => {
    if (this.params.id === 20) {
      return { affected: 1 };
    }
    if (this.params.id === 15) {
      return { affected: 0 };
    }
    return {};
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  where = vi.fn((_query: unknown, params: Record<string, unknown>) => {
    this.params = params;
    return {};
  });
}
const dummyDeleteQueryBuilder = new DummyDeleteQueryBuilder();
class DummyQueryBuilder {
  delete = vi.fn(() => {
    return dummyDeleteQueryBuilder;
  });
  getCount = vi.fn(() => {
    return 42;
  });
  getMany() {
    return [{ id: 1, name: 'Alice' }];
  }
  skip() {
    return this;
  }
  softDelete = vi.fn(() => {
    return dummyDeleteQueryBuilder;
  });
  take() {
    return this;
  }
  where() {
    return this;
  }
}
const dummyQueryBuilder = new DummyQueryBuilder() as unknown as SelectQueryBuilder<DummyEntity>;
// Create a dummy transaction manager.
const dummyTransactionManager = {
  save: vi.fn(async <T extends DummyEntity | DummyEntity[]>(_entity: string, data: T) => {
    return data;
  })
} as unknown as EntityManager;
// Create a dummy repository with only the methods used by RDBEntityService.
const dummyRepository = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  count: vi.fn(async (_options?: CountOptions): Promise<number> => {
    return 42;
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createQueryBuilder: vi.fn((_entityName: string) => {
    return dummyQueryBuilder;
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete: vi.fn(async (_criteria: Partial<DummyEntity>): Promise<DeleteResult> => {
    return {} as DeleteResult;
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  find: vi.fn(async (_options?: RDBFindOptions): Promise<DummyEntity[]> => {
    return [{ id: 1, name: 'Alice' }];
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findOne: vi.fn(async (_criteria: Partial<DummyEntity>, _options?: FindOneOptions) => {
    return { id: 1, name: 'Alice' } as DummyEntity;
  }),
  metadata: { tableName: 'dummy_table' } as unknown as EntityMetadata,
  manager: {
    transaction: async <T>(cb: (_manager: EntityManager) => Promise<T>): Promise<T> => {
      return cb(dummyTransactionManager);
    }
  } as EntityManager,
  save: vi.fn(async <T extends DummyEntity | DummyEntity[]>(data: T) => {
    return data;
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  softDelete: vi.fn(async (_criteria: Partial<DummyEntity>): Promise<DeleteResult> => {
    return {} as DeleteResult;
  }),
  update: vi.fn(
    async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _criteria: Partial<DummyEntity>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _partialEntity: QueryDeepPartialEntity<DummyEntity>
    ): Promise<UpdateResult> => {
      return { affected: 1 } as UpdateResult;
    }
  )
} as unknown as Repository<DummyEntity>;
// ----- Define a real EntitySchema for DummyEntity -----
const dummySchema = new EntitySchema<DummyEntity>({
  name: 'DummyEntity',
  columns: {
    id: {
      type: Number,
      primary: true
    },
    name: {
      type: String
    }
  }
});
// Instantiate the service using the real SQLQueryBuilderService.
const service = new RDBEntityService<DummyEntity>(realSQLQueryBuilderService, dummyRepository, dummySchema);

describe('RDBEntityService (with mocks)', () => {
  const entity1: DummyEntity = { id: 1, name: 'Alice' };
  const entity2: DummyEntity = { id: 2, name: 'Bob' };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should extract primary keys from schema (old)', () => {
      const primaryKeys = (service as unknown as { primaryKeys: string[] })['primaryKeys'];
      expect(primaryKeys).toEqual(['id']);
    });
  });

  describe('buildPrimaryKeyWhereClause', () => {
    it('should build clause for a single primary key', () => {
      const buildClause = (
        service as unknown as {
          buildPrimaryKeyWhereClause(_data: DummyEntity[]): { field: string; value: ParsedFilter };
        }
      )['buildPrimaryKeyWhereClause'].bind(service);
      const clause = buildClause([entity1, entity2]);
      expect(clause.field).toBe('id');
      expect(clause.value.params).toEqual({ id: [1, 2] });
      // Use the real SQLQueryBuilderService's columnQuotesSymbol.
      expect(clause.value.query).toContain(
        `${realSQLQueryBuilderService.columnQuotesSymbol}${dummyRepository.metadata.tableName}${realSQLQueryBuilderService.columnQuotesSymbol}` +
          `.${realSQLQueryBuilderService.columnQuotesSymbol}id${realSQLQueryBuilderService.columnQuotesSymbol} in :id`
      );
    });
    it('should build clause for composite primary keys', () => {
      interface CompositeEntity extends ObjectLiteral {
        key1: string;
        key2: number;
        value: string;
      }
      const compositeSchema = new EntitySchema<CompositeEntity>({
        name: 'CompositeEntity',
        columns: {
          key1: { type: String, primary: true },
          key2: { type: Number, primary: true },
          value: { type: String }
        }
      });
      const compositeService = new RDBEntityService<CompositeEntity>(
        realSQLQueryBuilderService,
        dummyRepository as unknown as Repository<CompositeEntity>,
        compositeSchema
      );
      const data: CompositeEntity[] = [
        { key1: 'a', key2: 1, value: 'v1' },
        { key1: 'b', key2: 2, value: 'v2' }
      ];
      const buildClauseComposite = (
        compositeService as unknown as {
          buildPrimaryKeyWhereClause(_data: CompositeEntity[]): { field: string; value: ParsedFilter };
        }
      )['buildPrimaryKeyWhereClause'].bind(compositeService);
      const clause = buildClauseComposite(data);
      expect(clause.field).toBe(SelectOperator.Or);
      expect(clause.value.params).toEqual({
        key10: 'a',
        key11: 'b',
        key20: 1,
        key21: 2
      });
      expect(clause.value.query).toContain('or');
      expect(clause.value.query).toContain('and');
    });
  });

  describe('bulkCreate', () => {
    const bulkData: DummyEntity[] = [
      { id: 3, name: 'Charlie' },
      { id: 4, name: 'Dana' }
    ];
    it('should perform bulk create without transaction when forceTransaction is false', async () => {
      const result = await service.bulkCreate(bulkData);
      expect(result).toEqual(bulkData);
      expect(dummyRepository.save).toHaveBeenCalledWith(bulkData);
    });
    it('should perform bulk create within a transaction when forceTransaction is true', async () => {
      const options: BulkCreateOptions = { forceTransaction: true };
      const transactionSpy = vi.spyOn(dummyRepository.manager, 'transaction');
      const result = await service.bulkCreate(bulkData, options);
      expect(result).toEqual(bulkData);
      expect(transactionSpy).toHaveBeenCalled();
      expect(dummyTransactionManager.save).toHaveBeenCalledWith(dummyRepository.target, bulkData);
    });
  });

  describe('create', () => {
    const newEntity: DummyEntity = { id: 5, name: 'Eve' };
    it('should create a single entity without transaction', async () => {
      const result = await service.create(newEntity);
      expect(result).toEqual(newEntity);
      expect(dummyRepository.save).toHaveBeenCalledWith(newEntity);
    });
    it('should create a single entity within a transaction when forceTransaction is true', async () => {
      const options: CreateOptions = { forceTransaction: true };
      const transactionSpy = vi.spyOn(dummyRepository.manager, 'transaction');
      const result = await service.create(newEntity, options);
      expect(result).toEqual(newEntity);
      expect(transactionSpy).toHaveBeenCalled();
      expect(dummyTransactionManager.save).toHaveBeenCalledWith(dummyRepository.target, newEntity);
    });
  });

  describe('count', () => {
    it('should return a count of entities', async () => {
      const options: CountOptions = {};
      const result = await service.count(options);
      expect(result).toBe(42);
    });
  });

  describe('delete', () => {
    it('should delete an entity and return the count of deleted items when affected > 0', async () => {
      const criteria = { id: 20 };
      const result = await service.delete({ filters: criteria });
      expect(result).toEqual({ count: 1 });
      expect(dummyQueryBuilder.softDelete).toHaveBeenCalled();
      expect(dummyDeleteQueryBuilder.where).toHaveBeenCalledWith('`dummy_table`.`id` = :id', criteria);
      expect(dummyDeleteQueryBuilder.execute).toHaveBeenCalled();
    });
    it('should return the count of deleted items when affected = 0', async () => {
      const criteria = { id: 15 };
      const result = await service.delete({ filters: criteria });
      expect(result).toEqual({ count: 0 });
      expect(dummyQueryBuilder.softDelete).toHaveBeenCalled();
      expect(dummyDeleteQueryBuilder.where).toHaveBeenCalledWith('`dummy_table`.`id` = :id', criteria);
      expect(dummyDeleteQueryBuilder.execute).toHaveBeenCalled();
    });
    it('should return count=undefined if the SQL driver does not support returning affected count', async () => {
      const criteria = { id: 10 };
      const result = await service.delete({ filters: criteria });
      expect(result).toEqual({ count: undefined });
      expect(dummyQueryBuilder.softDelete).toHaveBeenCalled();
      expect(dummyDeleteQueryBuilder.where).toHaveBeenCalledWith('`dummy_table`.`id` = :id', criteria);
      expect(dummyDeleteQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    const findOptions: RDBFindOptions = { filters: { id: 1 } };
    const findResults = {
      items: [{ id: 1, name: 'Alice' }],
      more: false,
      page: 1,
      perPage: 10
    };
    it('should return find results', async () => {
      const results = await service.find(findOptions);
      expect(results).toEqual(findResults);
    });
  });
});
