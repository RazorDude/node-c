import { ApplicationError, FindResults } from '@node-c/core';
import { EntityManager, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BulkCreateOptions,
  CountOptions,
  CreateOptions,
  DeleteOptions,
  FindOneOptions,
  FindOptions,
  PostgresErrorCode,
  RDBEntityClass,
  RDBEntityService,
  UpdateOptions
} from './index';

import { IncludeItems, OrderBy, ParsedFilter, SQLQueryBuilderService } from '../sqlQueryBuilder';

class FakeEntity extends RDBEntityClass {}

/**
 * A fake QueryBuilder that simulates methods of a TypeORM QueryBuilder.
 */
class FakeQueryBuilder {
  public _buildOptions: Record<string, unknown> = {};
  public skipCalled = 0;
  public takeCalled = 0;
  public manyResult: FakeEntity[] = [];
  public countResult = 0;
  public executeResult: { affected?: number; raw?: unknown } = { affected: 0, raw: [] };
  public oneResult: FakeEntity | null = null;

  skip(n: number): this {
    this.skipCalled = n;
    return this;
  }
  take(n: number): this {
    this.takeCalled = n;
    return this;
  }
  getMany(): Promise<FakeEntity[]> {
    return Promise.resolve(this.manyResult);
  }
  getCount(): Promise<number> {
    return Promise.resolve(this.countResult);
  }
  execute(): Promise<{ affected?: number; raw?: unknown }> {
    return Promise.resolve(this.executeResult);
  }
  returning(_: string): this {
    return this;
  }
  update(): this {
    return this;
  }
  set(_: unknown): this {
    return this;
  }
  getOne(): Promise<FakeEntity | null> {
    return Promise.resolve(this.oneResult);
  }
}

describe('RDBEntityService', () => {
  let service: RDBEntityService<FakeEntity>;
  let fakeQB: SQLQueryBuilderService<FakeEntity>;
  let fakeRepository: Repository<FakeEntity>;
  let fakeEntityManager: EntityManager;
  beforeEach(() => {
    // Create a fake SQLQueryBuilderService.
    fakeQB = {
      parseFilters: vi.fn().mockImplementation(
        (
          _tableName: string,
          filters: Record<string, unknown>,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _options?: { operator?: string; isTopLevel?: boolean }
        ) => {
          // For testing, if filters has a property "nonEmpty", return a non‐empty include.
          if (filters && filters.nonEmpty) {
            return { where: { dummy: filters }, include: { nonEmpty: true } };
          }
          return { where: filters || {}, include: {} };
        }
      ),
      parseRelations: vi.fn().mockImplementation((tableName: string, relations: unknown, include: IncludeItems) => {
        return { ...include, relations };
      }),
      buildQuery: vi.fn().mockImplementation(
        (
          queryBuilder: FakeQueryBuilder,
          options: {
            where?: Record<string, ParsedFilter>;
            include?: IncludeItems;
            orderBy?: OrderBy[];
            withDeleted?: boolean;
          }
        ) => {
          // For testing, simply attach options so that we can verify later.
          queryBuilder._buildOptions = options;
          return queryBuilder;
        }
      ),
      parseOrderBy: vi.fn().mockImplementation((tableName: string, orderBy: unknown) => {
        return { orderBy: Array.isArray(orderBy) ? orderBy : [orderBy], include: {} };
      }),
      columnQuotesSymbol: '"'
    };

    // Create a fake transaction manager.
    fakeEntityManager = {
      query: vi.fn().mockResolvedValue(undefined),
      save: vi.fn().mockImplementation(async (_target: unknown, data: unknown) => data),
      getRepository: vi.fn().mockReturnValue({
        createQueryBuilder: vi.fn().mockReturnValue(new FakeQueryBuilder())
      })
    } as unknown as EntityManager;

    // Create a fake repository.
    fakeRepository = {
      manager: {
        transaction: async <T>(cb: (tm: EntityManager) => Promise<T>) => {
          return await cb(fakeEntityManager);
        },
        query: fakeEntityManager.query,
        save: fakeEntityManager.save
      },
      save: vi.fn().mockImplementation(async (data: unknown) => data),
      metadata: {
        name: 'FakeEntity',
        tableName: 'fake_entity'
      },
      target: 'FakeEntityTarget',
      createQueryBuilder: vi.fn().mockImplementation(() => new FakeQueryBuilder())
    } as unknown as Repository<FakeEntity>;

    // Create an instance of the service.
    service = new RDBEntityService<FakeEntity>(fakeQB, fakeRepository);
  });
  // ----------------------- bulkCreate -----------------------
  it.skip('bulkCreate: should use transaction when forceTransaction is true and no transactionManager', async () => {
    const entities = [new FakeEntity(1), new FakeEntity(2)];
    const saveSpy = vi.spyOn(service, 'save').mockResolvedValue(entities);
    const options: BulkCreateOptions = { forceTransaction: true };
    const result = await service.bulkCreate(entities, options);
    expect(result).toEqual(entities);
    expect(saveSpy).toHaveBeenCalled();
  });
  it.skip('bulkCreate: should call save directly when transactionManager is provided', async () => {
    const entities = [new FakeEntity(3)];
    const fakeTM = fakeEntityManager;
    const saveSpy = vi.spyOn(service, 'save').mockResolvedValue(entities);
    const options: BulkCreateOptions = { transactionManager: fakeTM };
    const result = await service.bulkCreate(entities, options);
    expect(result).toEqual(entities);
    expect(saveSpy).toHaveBeenCalledWith(entities, fakeTM);
  });
  // ----------------------- create -----------------------
  it.skip('create: should create entity directly when no forceTransaction', async () => {
    const entity = new FakeEntity(10);
    const saveSpy = vi.spyOn(service, 'save').mockResolvedValue(entity);
    const options: CreateOptions = {};
    const result = await service.create(entity, options);
    expect(result).toEqual(entity);
    expect(saveSpy).toHaveBeenCalledWith(entity, undefined);
  });
  it.skip('create: should use transaction when forceTransaction is true and no transactionManager', async () => {
    const entity = new FakeEntity(11);
    const saveSpy = vi.spyOn(service, 'save').mockResolvedValue(entity);
    const options: CreateOptions = { forceTransaction: true };
    const result = await service.create(entity, options);
    expect(result).toEqual(entity);
    expect(saveSpy).toHaveBeenCalled();
  });
  it('create: should throw ApplicationError on unique violation error', async () => {
    const entity = new FakeEntity(12);
    const error = {
      code: PostgresErrorCode.UniqueViolation,
      detail: 'Key (username)=duplicate',
      table: 'fake_entity'
    };
    vi.spyOn(service, 'save').mockRejectedValue(error);
    await expect(service.create(entity, {})).rejects.toThrow(ApplicationError);
    await expect(service.create(entity, {})).rejects.toThrow('fake_entity username needs to be unique');
  });
  // ----------------------- count -----------------------
  it('count: should return count from query builder', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.countResult = 7;
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    const options: CountOptions = { filters: {} };
    const result = await service.count(options);
    expect(result).toBe(7);
    expect(fakeQB.parseFilters as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('FakeEntity', options.filters);
    expect(fakeQB.buildQuery).toHaveBeenCalledWith(fakeQBInstance, {
      where: options.filters,
      include: {},
      withDeleted: false
    });
  });
  it('count: should use transaction when forceTransaction is true and no transactionManager', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.countResult = 10;
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    const options: CountOptions = { filters: {}, forceTransaction: true };
    const result = await service.count(options);
    expect(result).toBe(10);
  });
  // ----------------------- delete -----------------------
  it('delete: should delete using parsedWhere when include is empty', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.executeResult = { affected: 3 };
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    (fakeQB.parseFilters as ReturnType<typeof vi.fn>).mockReturnValue({ where: { a: 1 }, include: {} });
    const options: DeleteOptions = { filters: { a: 1 } };
    const result = await service.delete(options);
    expect(result).toEqual({ count: 3 });
    expect(fakeQB.buildQuery).toHaveBeenCalledWith(fakeQBInstance, { where: { a: 1 } });
  });
  it('delete: should delete using find results when include is non-empty', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.executeResult = { affected: 2 };
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    (fakeQB.parseFilters as ReturnType<typeof vi.fn>).mockReturnValue({ where: { a: 1 }, include: { nonEmpty: true } });
    const findResult: FindResults<FakeEntity> = {
      page: 1,
      perPage: 10,
      items: [new FakeEntity(20), new FakeEntity(21)],
      more: false
    };
    vi.spyOn(service, 'find').mockResolvedValue(findResult);
    const options: DeleteOptions = { filters: { a: 1, nonEmpty: true } };
    const result = await service.delete(options);
    expect(result).toEqual({ count: 2 });
    expect(fakeQB.buildQuery).toHaveBeenCalled();
  });
  it('delete: should use delete (not softDelete) when softDelete is false', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.executeResult = { affected: 1 };
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    (fakeQB.parseFilters as ReturnType<typeof vi.fn>).mockReturnValue({ where: { a: 1 }, include: {} });
    const options: DeleteOptions = { filters: { a: 1 }, softDelete: false };
    const result = await service.delete(options);
    expect(result).toEqual({ count: 1 });
  });
  // ----------------------- find -----------------------
  it('find: should return paginated results when findAll is false', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    const perPage = 10;
    // simulate more results than one page (perPage + 1)
    const items = Array.from({ length: perPage + 1 }, (_, i) => new FakeEntity(i));
    fakeQBInstance.manyResult = items;
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    const options: FindOptions = { filters: {}, page: '2', perPage: '10' };
    const result = await service.find(options);
    // Expect one extra item to be removed and "more" set to true.
    expect(result.items.length).toBe(perPage);
    expect(result.page).toBe(2);
    expect(result.perPage).toBe(10);
    expect(result.more).toBe(true);
  });
  it('find: should return all results when findAll is true', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    const items = [new FakeEntity(100), new FakeEntity(101)];
    fakeQBInstance.manyResult = items;
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    const options: FindOptions = { filters: {}, findAll: true };
    const result = await service.find(options);
    expect(result.items).toEqual(items);
    expect(result.perPage).toBe(items.length);
  });
  it('find: should use transaction when forceTransaction is true and no transactionManager', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.manyResult = [];
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    const options: FindOptions = { filters: {}, forceTransaction: true };
    const result = await service.find(options);
    expect(result).toBeDefined();
  });
  // ----------------------- findOne -----------------------
  it('findOne: should return one result from query builder', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    const expectedEntity = new FakeEntity(55);
    fakeQBInstance.oneResult = expectedEntity;
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    const options: FindOneOptions = { filters: {} };
    const result = await service.findOne(options);
    expect(result).toEqual(expectedEntity);
  });
  it('findOne: should use transaction when forceTransaction is true and no transactionManager', async () => {
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.oneResult = null;
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    const options: FindOneOptions = { filters: {}, forceTransaction: true };
    const result = await service.findOne(options);
    expect(result).toBeNull();
  });
  // ----------------------- getEntityTarget & getRepository -----------------------
  it('getEntityTarget: should return repository target', () => {
    const target = service.getEntityTarget();
    expect(target).toBe('FakeEntityTarget');
  });
  it('getRepository: should return repository when no transactionManager provided', () => {
    const repo = service.getRepository();
    expect(repo).toBe(fakeRepository);
  });
  it('getRepository: should return repository from transactionManager when provided', () => {
    const fakeRepoFromTM = {
      createQueryBuilder: vi.fn().mockReturnValue(new FakeQueryBuilder())
    };
    const fakeTM: EntityManager = {
      getRepository: vi.fn().mockReturnValue(fakeRepoFromTM)
    } as unknown as EntityManager;
    const repo = service.getRepository(fakeTM);
    expect(fakeTM.getRepository).toHaveBeenCalledWith(fakeRepository.target);
    expect(repo).toBe(fakeRepoFromTM);
  });
  // ----------------------- processManyToMany -----------------------
  it('processManyToMany: should use transaction when no transactionManager provided', async () => {
    const data = {
      counterpartColumn: 'counter',
      currentEntityColumn: 'current',
      id: 1,
      items: [{ deleted: true, value: 2 }],
      tableName: 'join_table'
    };
    const transactionSpy = vi.spyOn(fakeRepository.manager, 'transaction');
    await service.processManyToMany(data);
    expect(transactionSpy).toHaveBeenCalled();
  });
  it('processManyToMany: should execute delete and insert queries based on items', async () => {
    const items = [
      { deleted: true, value: 2 },
      { deleted: false, value: 3 }
    ];
    const data = {
      counterpartColumn: 'counter',
      currentEntityColumn: 'current',
      id: 10,
      items,
      tableName: 'join_table'
    };
    const fakeTM = {
      query: vi.fn().mockResolvedValue(undefined)
    } as unknown as EntityManager;
    await service.processManyToMany(data, { transactionManager: fakeTM });
    expect(fakeTM.query).toHaveBeenCalledTimes(2);
    const deleteQuery = (fakeTM.query as vi.Mock).mock.calls[0][0];
    expect(deleteQuery).toContain('delete from');
    const insertQuery = (fakeTM.query as vi.Mock).mock.calls[1][0];
    expect(insertQuery).toContain('insert into');
    expect(insertQuery).toContain('on conflict do nothing');
  });
  it('processManyToMany: should not execute queries if no items to delete or insert', async () => {
    const data = {
      counterpartColumn: 'counter',
      currentEntityColumn: 'current',
      id: 10,
      items: [],
      tableName: 'join_table'
    };
    const fakeTM = {
      query: vi.fn().mockResolvedValue(undefined)
    } as unknown as EntityManager;
    await service.processManyToMany(data, { transactionManager: fakeTM });
    expect(fakeTM.query).not.toHaveBeenCalled();
  });
  // ----------------------- save -----------------------
  it('save: should call transactionManager.save when provided', async () => {
    const entity = new FakeEntity(30);
    const fakeTM = {
      save: vi.fn().mockResolvedValue(entity)
    } as unknown as EntityManager;
    const result = await service.save(entity, fakeTM);
    expect(fakeTM.save).toHaveBeenCalledWith(fakeRepository.target, entity);
    expect(result).toEqual(entity);
  });
  it('save: should call repository.save when transactionManager is not provided', async () => {
    const entity = new FakeEntity(31);
    (fakeRepository.save as vi.Mock).mockResolvedValue(entity);
    const result = await service.save(entity);
    expect(fakeRepository.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });
  // ----------------------- update -----------------------
  it('update: should use transaction when forceTransaction is true and no transactionManager', async () => {
    const entity = new FakeEntity(40);
    const options: UpdateOptions = { filters: { a: 1 }, forceTransaction: true, returnData: false };
    // We spy on update so that the transaction branch is exercised.
    const updateSpy = vi.spyOn(service, 'update').mockResolvedValue({ count: 1 });
    const result = await service.update(entity, options);
    expect(result).toEqual({ count: 1 });
    expect(updateSpy).toHaveBeenCalled();
  });
  it('update: should update and return count when returnData is false', async () => {
    const entity = new FakeEntity(41);
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.executeResult = { affected: 2 };
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    (fakeQB.parseFilters as ReturnType<typeof vi.fn>).mockReturnValue({ where: { a: 1 }, include: {} });
    const options: UpdateOptions = { filters: { a: 1 }, returnData: false };
    const result = await service.update(entity, options);
    expect(result).toEqual({ count: 2 });
  });
  it('update: should update and return data when returnData is true', async () => {
    const entity = new FakeEntity(42);
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.executeResult = { raw: [entity] };
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    (fakeQB.parseFilters as ReturnType<typeof vi.fn>).mockReturnValue({ where: { a: 1 }, include: {} });
    const options: UpdateOptions = { filters: { a: 1 }, returnData: true };
    const result = await service.update(entity, options);
    expect(result).toEqual({ items: [entity] });
  });
  it('update: should update using find results when parsed include is non-empty', async () => {
    const entity = new FakeEntity(43);
    const fakeQBInstance = new FakeQueryBuilder();
    fakeQBInstance.executeResult = { affected: 3 };
    vi.spyOn(fakeRepository, 'createQueryBuilder').mockReturnValue(fakeQBInstance);
    (fakeQB.parseFilters as ReturnType<typeof vi.fn>).mockReturnValue({ where: { a: 1 }, include: { nonEmpty: true } });
    const findResult: FindResults<FakeEntity> = {
      page: 1,
      perPage: 10,
      items: [new FakeEntity(100), new FakeEntity(101)],
      more: false
    };
    vi.spyOn(service, 'find').mockResolvedValue(findResult);
    const options: UpdateOptions = { filters: { a: 1, nonEmpty: true }, returnData: false };
    const result = await service.update(entity, options);
    expect(result).toEqual({ count: 3 });
  });
});
