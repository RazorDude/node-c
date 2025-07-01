import { Inject, Injectable } from '@nestjs/common';

import {
  AppConfig,
  AppConfigPersistanceNoSQL,
  ApplicationError,
  ConfigProviderService,
  GenericObject
} from '@node-c/core';

import { RedisClientType, createClient, createCluster } from 'redis';
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

// TODO: support switching between hashmap and non-hashmap methods (e.g. hget/get)
@Injectable()
export class RedisStoreService {
  protected defaultTTL?: number;
  protected storeDelimiter: string;
  protected storeKey: string;
  protected transactions: GenericObject<RedisTransaction>;
  protected useHashmap: boolean;

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.REDIS_CLIENT)
    // eslint-disable-next-line no-unused-vars
    protected client: RedisClientType,
    @Inject(Constants.REDIS_CLIENT_PERSISTANCE_MODULE_NAME)
    protected persistanceModuleName: string
  ) {
    const { defaultTTL, storeDelimiter, storeKey, useHashmap } = configProvider.config.persistance[
      persistanceModuleName
    ] as AppConfigPersistanceNoSQL;
    this.defaultTTL = defaultTTL;
    this.storeDelimiter = storeDelimiter || Constants.DEFAULT_STORE_DELIMITER;
    this.storeKey = storeKey;
    this.transactions = {};
    this.useHashmap = typeof useHashmap !== 'undefined' ? useHashmap : true;
  }

  static async createClient(config: AppConfig, options: { persistanceModuleName: string }): Promise<RedisClientType> {
    const { persistanceModuleName } = options;
    const { clusterMode, password, host, port, user } = config.persistance[
      persistanceModuleName
    ] as AppConfigPersistanceNoSQL;
    const actualHost = host || '0.0.0.0';
    const actualPassword = password || undefined;
    const actualPort = port || 6379;
    const actualUser = user || 'default';
    if (clusterMode) {
      const client = createCluster({
        defaults: {
          password: actualPassword,
          username: actualUser
        },
        rootNodes: [
          {
            url: `redis://${actualHost}:${actualPort}`
          }
        ]
      });
      await client.connect();
      return client as unknown as RedisClientType;
    }
    const client = createClient({
      password: actualPassword,
      socket: { host: actualHost, port: actualPort },
      username: actualUser
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
    const { client, storeDelimiter, storeKey, transactions, useHashmap } = this;
    const { transactionId } = options || ({} as StoreDeleteOptions);
    const handles = handle instanceof Array ? handle : [handle];
    if (transactionId) {
      const transaction = transactions[transactionId];
      if (!transaction) {
        throw new ApplicationError(`[RedisStoreService][Error]: Transaction with id "${transactionId}" not found.`);
      }
      transactions[transactionId] = useHashmap
        ? transaction.hDel(storeKey, handle)
        : transaction.del(handles.map(handleItem => `${storeKey}${storeDelimiter}${handleItem}`));
      // TODO: return the actual amount
      return 0;
    }
    return useHashmap
      ? await client.hDel(storeKey, handle)
      : await client.del(handles.map(handleItem => `${storeKey}${storeDelimiter}${handleItem}`));
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
    const { client, storeDelimiter, storeKey, useHashmap } = this;
    const { parseToJSON } = options || ({} as GetOptions);
    const value = useHashmap
      ? await client.hGet(storeKey, handle)
      : await client.get(`${storeKey}${storeDelimiter}${handle}`);
    return parseToJSON && typeof value === 'string' ? JSON.parse(value) : (value as Value);
  }

  // TODO: support scan from transaction data
  // TODO: optimize this method to reduce branches, ugly conidtional statements and repeatability
  async scan<Values = unknown[]>(handle: string, options: ScanOptions): Promise<{ cursor: number; values: Values }> {
    const { client, storeDelimiter, storeKey, useHashmap } = this;
    const { count, cursor: optCursor, parseToJSON, scanAll, withValues } = options;
    const getValues = typeof withValues === 'undefined' || withValues === true;
    const hashmapMethod = (getValues
      ? client.hScan.bind(client)
      : client.hScanNoValues.bind(client)) as unknown as RedisClientScanMethod;
    let cursor = 0;
    let keys: string[] = [];
    let parsedValues: unknown[] = [];
    let values: { field: string; value: string }[] = [];
    if (scanAll) {
      if (useHashmap) {
        while (true) {
          const {
            cursor: newCursor,
            keys: newKeys,
            tuples: newValues
          } = await hashmapMethod(storeKey, cursor, { count, match: handle });
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
        while (true) {
          const { cursor: newCursor, keys: newKeys } = await client.scan(cursor, {
            MATCH: `${storeKey}${storeDelimiter}${handle}`
          });
          cursor = newCursor;
          if (getValues) {
            for (const i in newKeys) {
              const key = newKeys[i];
              const value = await client.get(key);
              if (value === null) {
                continue;
              }
              values.push({ field: key, value });
            }
          } else {
            keys = keys.concat(newKeys!);
          }
          if (cursor === 0) {
            break;
          }
        }
      }
    } else {
      if (typeof count === 'undefined') {
        throw new ApplicationError('The "count" options is required when the "findAll" options is not positive.');
      }
      if (useHashmap) {
        const { keys: newKeys, tuples: newValues } = await hashmapMethod(storeKey, optCursor || 0, {
          count,
          match: handle
        });
        if (newValues) {
          values = values.concat(newValues);
        } else {
          keys = keys.concat(newKeys!);
        }
      } else {
        const { cursor: newCursor, keys: newKeys } = await client.scan(optCursor || 0, {
          COUNT: count,
          MATCH: `${storeKey}${storeDelimiter}${handle}`
        });
        cursor = newCursor;
        if (getValues) {
          for (const i in newKeys) {
            const key = newKeys[i];
            const value = await client.get(key);
            if (value === null) {
              continue;
            }
            values.push({ field: key, value });
          }
        } else {
          keys = keys.concat(newKeys!);
        }
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
    return { cursor, values: parsedValues as Values };
  }

  // TODO: fix hExpire
  // TODO: optimize this method to reduce branches, ugly conidtional statements and repeatability
  async set<Entry = unknown>(handle: string, entry: Entry, options?: SetOptions): Promise<void> {
    const { client, defaultTTL, storeDelimiter, storeKey, transactions, useHashmap } = this;
    const { transactionId, ttl } = options || ({} as SetOptions);
    const actualTTL = ttl || defaultTTL;
    const valueToSet = typeof entry !== 'string' ? JSON.stringify(entry) : entry;
    if (transactionId) {
      const transaction = transactions[transactionId];
      if (!transaction) {
        throw new ApplicationError(`[RedisStoreService][Error]: Transaction with id "${transactionId}" not found.`);
      }
      if (useHashmap) {
        transactions[transactionId] = transaction.hSet(this.storeKey, handle, valueToSet);
        // if (actualTTL) {
        //   transactions[transactionId] = transactions[transactionId].hExpire(this.storeKey, handle, actualTTL, 'NX');
        // }
      } else {
        const fullKey = `${storeKey}${storeDelimiter}${handle}`;
        transactions[transactionId] = transaction.set(fullKey, valueToSet);
        if (actualTTL) {
          transactions[transactionId] = transactions[transactionId].expire(fullKey, actualTTL, 'NX');
        }
      }
      return;
    }
    let result: unknown;
    if (useHashmap) {
      result = await client.hSet(storeKey, handle, valueToSet);
      // if (actualTTL) {
      // await client.hExpire(storeKey, handle, actualTTL, 'NX');
      // await client.expire(storeKey, actualTTL, 'NX');
      // }
    } else {
      const fullKey = `${storeKey}${storeDelimiter}${handle}`;
      result = await client.set(fullKey, valueToSet);
      if (actualTTL) {
        await client.expire(fullKey, actualTTL, 'NX');
      }
    }
    if (result !== 'OK' && result !== 1) {
      throw new ApplicationError(`[RedisStoreService][Error]: Value not set for handle "${handle}". Result: ${result}`);
    }
  }
}
