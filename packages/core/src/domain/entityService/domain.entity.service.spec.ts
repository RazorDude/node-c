import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainEntityService } from './domain.entity.service';

import {
  DataDeleteOptions,
  DataDeleteResult,
  DataEntityService,
  DataFindOneOptions,
  DataFindOptions,
  DataFindResults,
  DataUpdateOptions,
  DataUpdateResult
} from '../../data/entityService';

interface TestEntity {
  id: number;
  name: string;
}

describe('DomainEntityService', () => {
  let mockDataService: DataEntityService<TestEntity>;
  let domainService: DomainEntityService<TestEntity, DataEntityService<TestEntity>>;

  beforeEach(() => {
    // Create a fully typed mock for the underlying persistence service.
    mockDataService = {
      bulkCreate: vi.fn().mockResolvedValue([{ id: 1, name: 'Test1' }]),
      create: vi.fn().mockResolvedValue({ id: 2, name: 'Test2' }),
      count: vi.fn().mockResolvedValue({ count: 0 }),
      delete: vi.fn().mockResolvedValue({ affected: 1 } as DataDeleteResult),
      find: vi.fn().mockResolvedValue({ items: [{ id: 3, name: 'Test3' }] } as DataFindResults<TestEntity>),
      findOne: vi.fn().mockResolvedValue({ id: 4, name: 'Test4' }),
      getEntityName: vi.fn().mockResolvedValue('mockEntity'),
      update: vi.fn().mockResolvedValue({ updated: { id: 5, name: 'Test5' } } as DataUpdateResult<TestEntity>)
    };
    domainService = new DomainEntityService<TestEntity, DataEntityService<TestEntity>>(mockDataService);
  });

  describe('bulkCreate', () => {
    it('should call dataEntityService.bulkCreate with the provided data and return its result', async () => {
      const data: TestEntity[] = [{ id: 10, name: 'BulkTest' }];
      const result = await domainService.bulkCreate(data);
      expect(mockDataService.bulkCreate).toHaveBeenCalledWith(data);
      expect(result).toEqual({ result: [{ id: 1, name: 'Test1' }] });
    });
    it('should propagate errors from bulkCreate', async () => {
      const error = new Error('bulk error');
      (mockDataService.bulkCreate as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.bulkCreate([{ id: 0, name: 'Error' }])).rejects.toThrow('bulk error');
    });
  });

  describe('create', () => {
    it('should call dataEntityService.create with the provided data and return its result', async () => {
      const data: TestEntity = { id: 20, name: 'CreateTest' };
      const result = await domainService.create(data);
      expect(mockDataService.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ result: { id: 2, name: 'Test2' } });
    });
    it('should propagate errors from create', async () => {
      const error = new Error('create error');
      (mockDataService.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.create({ id: 0, name: 'Error' })).rejects.toThrow('create error');
    });
  });

  describe('delete', () => {
    it('should call dataEntityService.delete with correct options and return its result', async () => {
      const options: DataDeleteOptions = { filters: { id: 1 } };
      const result = await domainService.delete(options);
      expect(mockDataService.delete).toHaveBeenCalledWith(options);
      expect(result).toEqual({ result: { affected: 1 } });
    });
    it('should propagate errors from delete', async () => {
      const error = new Error('delete error');
      (mockDataService.delete as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.delete({ filters: { id: 999 } })).rejects.toThrow('delete error');
    });
  });

  describe('find', () => {
    it('should call dataEntityService.find with correct options and return its result', async () => {
      const options: DataFindOptions = { filters: { name: 'Test' } };
      const result = await domainService.find(options);
      expect(mockDataService.find).toHaveBeenCalledWith(options);
      expect(result).toEqual({ result: { items: [{ id: 3, name: 'Test3' }] } });
    });
    it('should propagate errors from find', async () => {
      const error = new Error('find error');
      (mockDataService.find as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.find({ filters: { name: 'Error' } })).rejects.toThrow('find error');
    });
  });

  describe('findOne', () => {
    it('should call dataEntityService.findOne with correct options and return its result', async () => {
      const options: DataFindOneOptions = { filters: { id: 4 } };
      const result = await domainService.findOne(options);
      expect(mockDataService.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual({ result: { id: 4, name: 'Test4' } });
    });
    it('should propagate errors from findOne', async () => {
      const error = new Error('findOne error');
      (mockDataService.findOne as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.findOne({ filters: { id: 999 } })).rejects.toThrow('findOne error');
    });
  });

  describe('update', () => {
    it('should call dataEntityService.update with correct data and options and return its result', async () => {
      const data: TestEntity = { id: 30, name: 'UpdateTest' };
      const options: DataUpdateOptions = { filters: { id: 30 } };
      const result = await domainService.update(data, options);
      expect(mockDataService.update).toHaveBeenCalledWith(data, options);
      expect(result).toEqual({ result: { updated: { id: 5, name: 'Test5' } } });
    });
    it('should propagate errors from update', async () => {
      const error = new Error('update error');
      (mockDataService.update as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.update({ id: 0, name: 'Error' }, { filters: { id: 0 } })).rejects.toThrow(
        'update error'
      );
    });
  });
});
