import type { DataFindResults } from '@node-c/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BulkCreateOptions,
  CreateOptions,
  DeleteOptions,
  FindOneOptions,
  RedisEntityService,
  UpdateOptions
} from './index';

import type { RedisRepositoryService } from '../repository';
import type { RedisStoreService } from '../store';

interface DummyEntity {
  createdAt?: Date;
  id: string;
  updatedAt?: Date;
  value?: number;
}
const entity1: DummyEntity = { createdAt: new Date(), id: '1', updatedAt: new Date(), value: 10 };
const entity2: DummyEntity = { createdAt: new Date(), id: '2', updatedAt: new Date(), value: 20 };

describe('RedisEntityService', () => {
  let dummyRepository: Partial<RedisRepositoryService<DummyEntity>>;
  let dummyStore: Partial<RedisStoreService>;
  let service: RedisEntityService<DummyEntity>;
  beforeEach(() => {
    dummyRepository = {
      save: vi.fn(),
      find: vi.fn()
    };
    dummyStore = {
      createTransaction: vi.fn(),
      endTransaction: vi.fn().mockResolvedValue(undefined)
    };
    service = new RedisEntityService(
      dummyRepository as unknown as RedisRepositoryService<DummyEntity>,
      dummyStore as unknown as RedisStoreService
    );
  });

  describe('bulkCreate', () => {
    it('returns repository.save result when no options provided', async () => {
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue([entity1, entity2]);
      const res = await service.bulkCreate([entity1, entity2]);
      expect(dummyRepository.save).toHaveBeenCalledWith([entity1, entity2], { transactionId: undefined });
      expect(res).toEqual([entity1, entity2]);
    });
    it('returns repository.save result when transactionId provided', async () => {
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue([entity1, entity2]);
      const opts: BulkCreateOptions = { transactionId: 'tx1' };
      const res = await service.bulkCreate([entity1, entity2], opts);
      expect(dummyRepository.save).toHaveBeenCalledWith([entity1, entity2], { transactionId: 'tx1' });
      expect(res).toEqual([entity1, entity2]);
    });
    it('wraps call in transaction when forceTransaction is true and no transactionId', async () => {
      (dummyStore.createTransaction as ReturnType<typeof vi.fn>).mockReturnValue('tx2');
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue([entity1]);
      const opts: BulkCreateOptions = { forceTransaction: true };
      const res = await service.bulkCreate([entity1], opts);
      expect(dummyStore.createTransaction).toHaveBeenCalled();
      expect(dummyRepository.save).toHaveBeenCalledWith([entity1], { transactionId: 'tx2' });
      expect(dummyStore.endTransaction).toHaveBeenCalledWith('tx2');
      expect(res).toEqual([entity1]);
    });
  });

  describe('create', () => {
    it('returns first element of repository.save when no options are provided', async () => {
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue([entity1]);
      const res = await service.create(entity1);
      expect(dummyRepository.save).toHaveBeenCalledWith(entity1, { transactionId: undefined });
      expect(res).toEqual(entity1);
    });
    it('returns first element of repository.save when transactionId provided', async () => {
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue([entity1]);
      const opts: CreateOptions = { transactionId: 'tx3' };
      const res = await service.create(entity1, opts);
      expect(dummyRepository.save).toHaveBeenCalledWith(entity1, { transactionId: 'tx3' });
      expect(res).toEqual(entity1);
    });
    it('wraps call in transaction when forceTransaction is true and no transactionId', async () => {
      (dummyStore.createTransaction as ReturnType<typeof vi.fn>).mockReturnValue('tx4');
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue([entity1]);
      const opts: CreateOptions = { forceTransaction: true };
      const res = await service.create(entity1, opts);
      expect(dummyStore.createTransaction).toHaveBeenCalled();
      expect(dummyRepository.save).toHaveBeenCalledWith(entity1, { transactionId: 'tx4' });
      expect(dummyStore.endTransaction).toHaveBeenCalledWith('tx4');
      expect(res).toEqual(entity1);
    });
  });

  describe('count', () => {
    it('returns the length of repository.find result', async () => {
      (dummyRepository.find as ReturnType<typeof vi.fn>).mockResolvedValue([entity1, entity2]);
      const cnt = await service.count({ filters: {}, findAll: false });
      expect(dummyRepository.find).toHaveBeenCalledWith({ filters: {}, findAll: false });
      expect(cnt).toEqual(2);
    });
  });

  describe('delete', () => {
    it('wraps call in transaction when forceTransaction is true and no transactionId', async () => {
      (dummyStore.createTransaction as ReturnType<typeof vi.fn>).mockReturnValue('tx5');
      vi.spyOn(service, 'find').mockResolvedValue({ items: [entity1] } as DataFindResults<DummyEntity>);
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(['key1']);
      const opts: DeleteOptions = { filters: {}, forceTransaction: true };
      const res = await service.delete(opts);
      expect(dummyStore.createTransaction).toHaveBeenCalled();
      expect(dummyRepository.save).toHaveBeenCalledWith([entity1], { delete: true, transactionId: 'tx5' });
      expect(dummyStore.endTransaction).toHaveBeenCalledWith('tx5');
      expect(res).toEqual({ count: 1 });
    });
    it('deletes normally when transactionId provided', async () => {
      vi.spyOn(service, 'find').mockResolvedValue({ items: [entity1, entity2] } as DataFindResults<DummyEntity>);
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(['k1', 'k2']);
      const opts: DeleteOptions = { filters: {}, transactionId: 'tx6' };
      const res = await service.delete(opts);
      expect(dummyRepository.save).toHaveBeenCalledWith([entity1, entity2], { delete: true, transactionId: 'tx6' });
      expect(res).toEqual({ count: 2 });
    });
  });

  describe('find', () => {
    it('parses page and perPage and sets "more" flag when items length equals perPage+1', async () => {
      const items = new Array(11).fill(entity1);
      (dummyRepository.find as ReturnType<typeof vi.fn>).mockResolvedValue(items);
      const res = await service.find({ filters: {}, findAll: false, page: 2, perPage: 10 });
      expect(dummyRepository.find).toHaveBeenCalledWith({ filters: {}, findAll: false, page: 2, perPage: 10 });
      expect(res.page).toEqual(2);
      expect(res.perPage).toEqual(10);
      expect(res.more).toBe(true);
      expect(res.items.length).toEqual(10);
    });
    it('sets perPage to items length when findAll is true', async () => {
      (dummyRepository.find as ReturnType<typeof vi.fn>).mockResolvedValue([entity1, entity2]);
      const res = await service.find({ filters: {}, findAll: true });
      expect(dummyRepository.find).toHaveBeenCalledWith({ filters: {}, findAll: true, page: 1, perPage: 10 });
      expect(res.perPage).toEqual(2);
      expect(res.more).toBe(false);
    });
  });

  describe('findOne', () => {
    it('returns the first element when repository.find returns a non-empty array', async () => {
      const expected = { id: '1', value: 1 } as unknown as DummyEntity;
      (dummyRepository.find as ReturnType<typeof vi.fn>).mockResolvedValue([expected]);
      const options: FindOneOptions = { filters: {} };
      const result = await service.findOne(options);
      expect(result).toEqual(expected);
    });
    it('returns null when repository.find returns an empty array', async () => {
      (dummyRepository.find as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      const options: FindOneOptions = { filters: {} };
      const result = await service.findOne(options);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('wraps call in transaction when forceTransaction is true and no transactionId', async () => {
      (dummyStore.createTransaction as ReturnType<typeof vi.fn>).mockReturnValue('tx7');
      vi.spyOn(service, 'findOne').mockResolvedValue(entity1);
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue([entity2]);
      const opts: UpdateOptions = { filters: {}, forceTransaction: true };
      const res = await service.update(entity2, opts);
      expect(dummyStore.createTransaction).toHaveBeenCalled();
      expect(dummyRepository.save).toHaveBeenCalledWith(expect.any(Object), { transactionId: 'tx7' });
      expect(dummyStore.endTransaction).toHaveBeenCalledWith('tx7');
      expect(res).toEqual({ count: 1, items: [entity2] });
    });
    it('returns update result with count 0 when findOne returns null', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(null);
      const opts: UpdateOptions = { filters: {}, transactionId: 'tx8' };
      const res = await service.update(entity2, opts);
      expect(res).toEqual({ count: 0, items: [] });
    });
    it('updates normally when findOne returns an item', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(entity1);
      (dummyRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue([entity2]);
      const opts: UpdateOptions = { filters: {}, transactionId: 'tx9' };
      const res = await service.update(entity2, opts);
      expect(dummyRepository.save).toHaveBeenCalledWith(expect.any(Object), { transactionId: 'tx9' });
      expect(res).toEqual({ count: 1, items: [entity2] });
    });
  });
});
