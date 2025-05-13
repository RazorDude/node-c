import { beforeEach, describe, expect, it } from 'vitest';

import { PersistanceEntityService } from './persistance.entity.service';
import {
  PersistanceDeleteOptions,
  PersistanceFindOneOptions,
  PersistanceFindOptions,
  PersistanceUpdateOptions
} from './persistance.entity.service.definitions';

import { ApplicationError } from '../../common/definitions';

// Define a dummy entity interface for testing.
interface DummyEntity {
  id: number;
  value: string;
}

// Optionally, define a subclass that does not override the methods.
class DummyPersistanceEntityService extends PersistanceEntityService<DummyEntity> {}

describe('PersistanceEntityService Base Class', () => {
  let service: PersistanceEntityService<DummyEntity>;

  beforeEach(() => {
    service = new PersistanceEntityService<DummyEntity>();
  });

  describe('bulkCreate', () => {
    it('should throw an ApplicationError with "bulkCreate" in the message', async () => {
      await expect(service.bulkCreate([{ id: 1, value: 'test' }])).rejects.toThrow(ApplicationError);
      await expect(service.bulkCreate([{ id: 1, value: 'test' }])).rejects.toThrow(/bulkCreate/);
    });
  });

  describe('create', () => {
    it('should throw an ApplicationError with "create" in the message', async () => {
      await expect(service.create({ id: 2, value: 'test' })).rejects.toThrow(ApplicationError);
      await expect(service.create({ id: 2, value: 'test' })).rejects.toThrow(/create/);
    });
  });

  describe('count', () => {
    it('should throw an ApplicationError with "count" in the message', async () => {
      const dummyOptions: PersistanceFindOptions = {} as PersistanceFindOptions;
      await expect(service.count(dummyOptions)).rejects.toThrow(ApplicationError);
      await expect(service.count(dummyOptions)).rejects.toThrow(/count/);
    });
  });

  describe('delete', () => {
    it('should throw an ApplicationError with "delete" in the message', () => {
      const dummyOptions: PersistanceDeleteOptions = {} as PersistanceDeleteOptions;
      expect(() => service.delete(dummyOptions)).toThrow(ApplicationError);
      expect(() => service.delete(dummyOptions)).toThrow(/delete/);
    });
  });

  describe('find', () => {
    it('should throw an ApplicationError with "find" in the message', () => {
      const dummyOptions: PersistanceFindOptions = {} as PersistanceFindOptions;
      expect(() => service.find(dummyOptions)).toThrow(ApplicationError);
      expect(() => service.find(dummyOptions)).toThrow(/find/);
    });
  });

  describe('findOne', () => {
    it('should throw an ApplicationError with "findOne" in the message', () => {
      const dummyOptions: PersistanceFindOneOptions = {} as PersistanceFindOneOptions;
      expect(() => service.findOne(dummyOptions)).toThrow(ApplicationError);
      expect(() => service.findOne(dummyOptions)).toThrow(/findOne/);
    });
  });

  describe('update', () => {
    it('should throw an ApplicationError with "update" in the message', async () => {
      const dummyData: DummyEntity = { id: 3, value: 'test' };
      const dummyOptions: PersistanceUpdateOptions = {} as PersistanceUpdateOptions;
      await expect(service.update(dummyData, dummyOptions)).rejects.toThrow(ApplicationError);
      await expect(service.update(dummyData, dummyOptions)).rejects.toThrow(/update/);
    });
  });
});

describe('DummyPersistanceEntityService Subclass', () => {
  let service: DummyPersistanceEntityService;

  beforeEach(() => {
    service = new DummyPersistanceEntityService();
  });
  it('bulkCreate should throw an error with "bulkCreate" in the message', async () => {
    await expect(service.bulkCreate([{ id: 10, value: 'dummy' }])).rejects.toThrow(/bulkCreate/);
  });
  it('create should throw an error with "create" in the message', async () => {
    await expect(service.create({ id: 11, value: 'dummy' })).rejects.toThrow(/create/);
  });
  it('count should throw an error with "count" in the message', async () => {
    await expect(service.count({} as PersistanceFindOptions)).rejects.toThrow(/count/);
  });
  it('delete should throw an error with "delete" in the message', () => {
    expect(() => service.delete({} as PersistanceDeleteOptions)).toThrow(/delete/);
  });
  it('find should throw an error with "find" in the message', () => {
    expect(() => service.find({} as PersistanceFindOptions)).toThrow(/find/);
  });
  it('findOne should throw an error with "findOne" in the message', () => {
    expect(() => service.findOne({} as PersistanceFindOneOptions)).toThrow(/findOne/);
  });
  it('update should throw an error with "update" in the message', async () => {
    await expect(service.update({ id: 12, value: 'dummy' }, {} as PersistanceUpdateOptions)).rejects.toThrow(/update/);
  });
});
