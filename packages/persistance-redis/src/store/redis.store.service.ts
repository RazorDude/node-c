import { Inject, Injectable } from '@nestjs/common';

import { AppConfig, AppConfigPersistanceNoSQL, ApplicationError, GenericObject } from '@node-c/core';

import { RedisClientType, createClient } from 'redis';
import { v4 as uuid } from 'uuid';

import {
  GetOptions,
  RedisClientScanMethod,
  RedisTransaction,
  ScanOptions,
  SetOptions,
  StoreDeleteOptions
} from './redis.store.definitions';

import { Constants } from '../common/definitions';

// TODO: support switching between h* and non-h* methods (e.g. hget/get)
@Injectable()
export class RedisStoreService {
  protected transactions: GenericObject<RedisTransaction>;

  constructor(
    @Inject(Constants.REDIS_CLIENT)
    // eslint-disable-next-line no-unused-vars
    protected client: RedisClientType,
    @Inject(Constants.REDIS_CLIENT_STORE_KEY)
    // eslint-disable-next-line no-unused-vars
    protected storeKey: string
  ) {
    this.transactions = {};
  }

  static async createClient(config: AppConfig, options: { persistanceModuleName: string }): Promise<RedisClientType> {
    const { persistanceModuleName } = options;
    const { password, host, port } = config.persistance[persistanceModuleName] as AppConfigPersistanceNoSQL;
    const client = createClient({
      password: password || undefined,
      socket: { host: host || '0.0.0.0', port: port || 6379 },
      username: 'default'
    });
    await client.connect();
    return client as RedisClientType;
  }

  createTransaction(): string {
    const transactionId = uuid();
    this.transactions[transactionId] = this.client.multi();
    return transactionId;
  }

  async delete(handle: string | string[], options?: StoreDeleteOptions): Promise<number> {
    const { transactions } = this;
    const { transactionId } = options || ({} as StoreDeleteOptions);
    if (transactionId) {
      const transaction = transactions[transactionId];
      if (!transaction) {
        throw new ApplicationError(`[RedisStoreService][Error]: Transaction with id "${transactionId}" not found.`);
      }
      transactions[transactionId] = transaction.hDel(this.storeKey, handle);
      // TODO: return the actual amount
      return 0;
    }
    return await this.client.hDel(this.storeKey, handle);
  }

  async endTransaction(transactionId: string): Promise<void> {
    const { transactions } = this;
    const transaction = transactions[transactionId];
    if (!transaction) {
      throw new ApplicationError(`[RedisStoreService][Error]: Transaction with id "${transactionId}" not found.`);
    }
    // TODO: how will we know whether it's successful or not?
    await transaction.exec();
    delete transactions[transactionId];
  }

  // TODO: support get from transaction data
  async get<Value = unknown>(handle: string, options?: GetOptions): Promise<Value> {
    const { parseToJSON } = options || ({} as GetOptions);
    const value = await this.client.hGet(this.storeKey, handle);
    return parseToJSON && typeof value === 'string' ? JSON.parse(value) : value;
  }

  // TODO: support scan from transaction data
  async scan<Values = unknown[]>(handle: string, options: ScanOptions): Promise<Values> {
    const { client, storeKey } = this;
    const { count, cursor: optCursor, parseToJSON, scanAll, withValues } = options;
    const method = (typeof withValues === 'undefined' || withValues === true
      ? client.hScan.bind(client)
      : client.hScanNoValues.bind(client)) as unknown as RedisClientScanMethod;
    let keys: string[] = [];
    let parsedValues: unknown[] = [];
    let values: { field: string; value: string }[] = [];
    if (scanAll) {
      let cursor = 0;
      while (true) {
        const {
          cursor: newCursor,
          keys: newKeys,
          tuples: newValues
        } = await method(storeKey, 0, { count, match: handle });
        cursor = newCursor;
        if (newValues) {
          values = values.concat(newValues);
        } else {
          keys = keys.concat(newKeys!);
        }
        if (cursor === 0) {
          break;
        }
      }
    } else {
      if (typeof count === 'undefined') {
        throw new ApplicationError('The "count" options is required when the "findAll" options is not positive.');
      }
      const { keys: newKeys, tuples: newValues } = await method(storeKey, optCursor || 0, { count, match: handle });
      if (newValues) {
        values = values.concat(newValues);
      } else {
        keys = keys.concat(newKeys!);
      }
    }
    if (parseToJSON) {
      for (const i in values) {
        const { value } = values[i];
        if (typeof value === 'string') {
          parsedValues.push(JSON.parse(value));
          continue;
        }
        parsedValues.push(value);
      }
    } else {
      parsedValues = values.map(({ value }) => value);
    }
    return parsedValues as Values;
  }

  async set<Entry = unknown>(handle: string, entry: Entry, options?: SetOptions): Promise<void> {
    const { transactions } = this;
    const { transactionId } = options || ({} as SetOptions);
    const valueToSet = typeof entry !== 'string' ? JSON.stringify(entry) : entry;
    if (transactionId) {
      const transaction = transactions[transactionId];
      if (!transaction) {
        throw new ApplicationError(`[RedisStoreService][Error]: Transaction with id "${transactionId}" not found.`);
      }
      transactions[transactionId] = transaction.hSet(this.storeKey, handle, valueToSet);
      return;
    }
    const result = (await this.client.hSet(this.storeKey, handle, valueToSet)) as unknown;
    if (result !== 'OK' && result !== 1) {
      throw new ApplicationError(`[RedisStoreService][Error]: Value not set for handle "${handle}". Result: ${result}`);
    }
  }
}
