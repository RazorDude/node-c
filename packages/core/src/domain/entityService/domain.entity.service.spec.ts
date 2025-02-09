import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainPersistanceEntityService } from './domain.entity.service';

import {
  DeleteOptions,
  DeleteResult,
  FindOneOptions,
  FindOptions,
  FindResults,
  PersistanceEntityService,
  UpdateOptions,
  UpdateResult
} from '../../persistance/entityService';

interface TestEntity {
  id: number;
  name: string;
}

describe('DomainPersistanceEntityService', () => {
  let mockPersistanceService: PersistanceEntityService<TestEntity>;
  let domainService: DomainPersistanceEntityService<TestEntity, PersistanceEntityService<TestEntity>>;

  beforeEach(() => {
    // Create a fully typed mock for the underlying persistence service.
    mockPersistanceService = {
      bulkCreate: vi.fn().mockResolvedValue([{ id: 1, name: 'Test1' }]),
      create: vi.fn().mockResolvedValue({ id: 2, name: 'Test2' }),
      count: vi.fn().mockResolvedValue({ count: 0 }),
      delete: vi.fn().mockResolvedValue({ affected: 1 } as DeleteResult),
      find: vi.fn().mockResolvedValue({ items: [{ id: 3, name: 'Test3' }] } as FindResults<TestEntity>),
      findOne: vi.fn().mockResolvedValue({ id: 4, name: 'Test4' }),
      update: vi.fn().mockResolvedValue({ updated: { id: 5, name: 'Test5' } } as UpdateResult<TestEntity>)
    };
    domainService = new DomainPersistanceEntityService<TestEntity, PersistanceEntityService<TestEntity>>(
      mockPersistanceService
    );
  });

  describe('bulkCreate', () => {
    it('should call persistanceEntityService.bulkCreate with the provided data and return its result', async () => {
      const data: TestEntity[] = [{ id: 10, name: 'BulkTest' }];
      const result = await domainService.bulkCreate(data);
      expect(mockPersistanceService.bulkCreate).toHaveBeenCalledWith(data);
      expect(result).toEqual([{ id: 1, name: 'Test1' }]);
    });
    it('should propagate errors from bulkCreate', async () => {
      const error = new Error('bulk error');
      (mockPersistanceService.bulkCreate as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.bulkCreate([{ id: 0, name: 'Error' }])).rejects.toThrow('bulk error');
    });
  });

  describe('create', () => {
    it('should call persistanceEntityService.create with the provided data and return its result', async () => {
      const data: TestEntity = { id: 20, name: 'CreateTest' };
      const result = await domainService.create(data);
      expect(mockPersistanceService.create).toHaveBeenCalledWith(data);
      expect(result).toEqual({ id: 2, name: 'Test2' });
    });
    it('should propagate errors from create', async () => {
      const error = new Error('create error');
      (mockPersistanceService.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.create({ id: 0, name: 'Error' })).rejects.toThrow('create error');
    });
  });

  describe('delete', () => {
    it('should call persistanceEntityService.delete with correct options and return its result', async () => {
      const options: DeleteOptions = { filters: { id: 1 } };
      const result = await domainService.delete(options);
      expect(mockPersistanceService.delete).toHaveBeenCalledWith(options);
      expect(result).toEqual({ affected: 1 });
    });
    it('should propagate errors from delete', async () => {
      const error = new Error('delete error');
      (mockPersistanceService.delete as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.delete({ filters: { id: 999 } })).rejects.toThrow('delete error');
    });
  });

  describe('find', () => {
    it('should call persistanceEntityService.find with correct options and return its result', async () => {
      const options: FindOptions = { filters: { name: 'Test' } };
      const result = await domainService.find(options);
      expect(mockPersistanceService.find).toHaveBeenCalledWith(options);
      expect(result).toEqual({ items: [{ id: 3, name: 'Test3' }] });
    });
    it('should propagate errors from find', async () => {
      const error = new Error('find error');
      (mockPersistanceService.find as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.find({ filters: { name: 'Error' } })).rejects.toThrow('find error');
    });
  });

  describe('findOne', () => {
    it('should call persistanceEntityService.findOne with correct options and return its result', async () => {
      const options: FindOneOptions = { filters: { id: 4 } };
      const result = await domainService.findOne(options);
      expect(mockPersistanceService.findOne).toHaveBeenCalledWith(options);
      expect(result).toEqual({ id: 4, name: 'Test4' });
    });
    it('should propagate errors from findOne', async () => {
      const error = new Error('findOne error');
      (mockPersistanceService.findOne as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.findOne({ filters: { id: 999 } })).rejects.toThrow('findOne error');
    });
  });

  describe('update', () => {
    it('should call persistanceEntityService.update with correct data and options and return its result', async () => {
      const data: TestEntity = { id: 30, name: 'UpdateTest' };
      const options: UpdateOptions = { filters: { id: 30 } };
      const result = await domainService.update(data, options);
      expect(mockPersistanceService.update).toHaveBeenCalledWith(data, options);
      expect(result).toEqual({ updated: { id: 5, name: 'Test5' } });
    });
    it('should propagate errors from update', async () => {
      const error = new Error('update error');
      (mockPersistanceService.update as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
      await expect(domainService.update({ id: 0, name: 'Error' }, { filters: { id: 0 } })).rejects.toThrow(
        'update error'
      );
    });
  });
});
