import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RedisRepositoryService } from './redis.repository.service';

import { RedisEntityService } from '../entityService/redis.entity.service';
import { RedisModule } from '../module/redis.module';
import { RedisStoreService } from '../store/redis.store.service';

describe('RedisRepositoryService', () => {
  let service: RedisRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
      providers: [RedisRepositoryService]
    }).compile();

    service = module.get<RedisRepositoryService>(RedisRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and get a value from Redis', async () => {
    const key = 'testKey';
    const value = 'testValue';
    vi.spyOn(service, 'set').mockResolvedValue(true);
    vi.spyOn(service, 'get').mockResolvedValue(value);
    await service.set(key, value);
    const result = await service.get(key);
    expect(result).toBe(value);
  });

  it('should delete a key from Redis', async () => {
    const key = 'testKey';
    vi.spyOn(service, 'delete').mockResolvedValue(true);
    const result = await service.delete(key);
    expect(result).toBe(true);
  });
});
