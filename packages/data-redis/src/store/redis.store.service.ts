import { Inject, Injectable } from '@nestjs/common';

import {
  AppConfig,
  AppConfigDataNoSQL,
  ApplicationError,
  ConfigProviderService,
  Constants as CoreConstants,
  GenericObject,
  NoSQLType
} from '@node-c/core';

import Redis, { ChainableCommander, Cluster, ClusterOptions, RedisOptions } from 'ioredis';
import Valkey from 'iovalkey';
import { v4 as uuid } from 'uuid';

import { GetOptions, ScanOptions, SetOptions, StoreDeleteOptions } from './redis.store.definitions';

import { Constants } from '../common/definitions';

// TODO: support switching between hashmap and non-hashmap methods (e.g. hget/get) on the method basis, rather than
// for the whole store
// TODO: support sets
@Injectable()
export class RedisStoreService {
  protected defaultTTL?: number;
  protected storeDelimiter: string;
  protected storeKey: string;
  protected transactions: GenericObject<ChainableCommander>;
  protected useHashmap: boolean;

  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(Constants.REDIS_CLIENT)
    // eslint-disable-next-line no-unused-vars
    protected client: Redis | Cluster,
    @Inject(CoreConstants.DATA_MODULE_NAME)
    protected dataModuleName: string
  ) {
    const { defaultTTL, storeDelimiter, storeKey, useHashmap } = configProvider.config.data[
      dataModuleName
    ] as AppConfigDataNoSQL;
    this.defaultTTL = defaultTTL;
    this.storeDelimiter = storeDelimiter || Constants.DEFAULT_STORE_DELIMITER;
    this.storeKey = storeKey;
    this.transactions = {};
    this.useHashmap = typeof useHashmap !== 'undefined' ? useHashmap : true;
  }

  static async createClient(config: AppConfig, options: { dataModuleName: string }): Promise<Redis | Cluster> {
    const { dataModuleName } = options;
    const {
      clusterMode,
      failOnConnectionError = true,
      password,
      host,
      port,
      sentinelMasterName,
      sentinelMode,
      sentinelPassword,
      sentinelRole,
      type,
      usePasswordForSentinelPassword,
      user
    } = config.data[dataModuleName] as AppConfigDataNoSQL;
    const actualHost = host || '0.0.0.0';
    const actualPassword = password?.length ? password : undefined;
    const actualPort = port || 6379;
    const actualUser = user?.length ? user : undefined;
    const clientOptions: {
      clusterRetryStrategy?: ClusterOptions['clusterRetryStrategy'];
      maxRetriesPerRequest?: RedisOptions['maxRetriesPerRequest'];
      retryStrategy?: RedisOptions['retryStrategy'];
      sentinelRetryStrategy?: RedisOptions['sentinelRetryStrategy'];
    } = {};
    let lastRetryAt = new Date().valueOf();
    const retryMethod = () => {
      const now = new Date().valueOf();
      // 1 minute retry interval
      if (Math.abs(lastRetryAt - now) > 60000) {
        lastRetryAt = now;
        return 500;
      }
      return null;
    };
    if (clusterMode) {
      if (!failOnConnectionError) {
        clientOptions.clusterRetryStrategy = retryMethod;
      }
      const ClusterConstructor = type === NoSQLType.Valkey ? Valkey.Cluster : Cluster;
      const client = new ClusterConstructor(RedisStoreService.getNodeList(actualHost, actualPort), {
        ...clientOptions,
        lazyConnect: true,
        redisOptions: { password: actualPassword, username: actualUser }
      });
      try {
        await client.connect();
      } catch (err) {
        console.error(`[RedisStore][${dataModuleName}]: Error connecting to Redis:`, err);
        if (failOnConnectionError) {
          throw err;
        }
        client.disconnect();
      }
      return client as Cluster;
    }
    if (sentinelMode) {
      if (!failOnConnectionError) {
        clientOptions.maxRetriesPerRequest = 0;
        clientOptions.sentinelRetryStrategy = retryMethod;
      }
      const SentinelConstructor = type === NoSQLType.Valkey ? Valkey : Redis;
      const client = new SentinelConstructor({
        ...clientOptions,
        lazyConnect: true,
        name: sentinelMasterName || 'mymaster',
        password: actualPassword,
        role: sentinelRole || 'master',
        sentinels: RedisStoreService.getNodeList(actualHost, actualPort),
        sentinelPassword: sentinelPassword?.length
          ? sentinelPassword
          : usePasswordForSentinelPassword
            ? actualPassword
            : undefined,
        username: actualUser
      });
      client.on('error', (error: unknown) => {
        console.error(`[RedisStore][${dataModuleName}]: Error:`, error);
      });
      try {
        await client.connect();
      } catch (err) {
        console.error(`[RedisStore][${dataModuleName}]: Error connecting to Redis:`, err);
        if (failOnConnectionError) {
          throw err;
        }
        client.disconnect();
      }
      return client as Redis;
    }
    if (!failOnConnectionError) {
      clientOptions.maxRetriesPerRequest = 0;
      clientOptions.retryStrategy = retryMethod;
    }
    const ClientConstructor = type === NoSQLType.Valkey ? Valkey : Redis;
    const client = new ClientConstructor({
      ...clientOptions,
      host: actualHost,
      lazyConnect: true,
      password: actualPassword,
      port: actualPort,
      username: actualUser
    });
    try {
      await client.connect();
    } catch (err) {
      console.error(`[RedisStore][${dataModuleName}]: Error connecting to Redis:`, err);
      if (failOnConnectionError) {
        throw err;
      }
      client.disconnect();
    }
    return client as Redis;
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
        ? transaction.hdel(storeKey, ...handles)
        : transaction.del(handles.map(handleItem => `${storeKey}${storeDelimiter}${handleItem}`));
      // TODO: return the actual amount
      return 0;
    }
    return useHashmap
      ? await client.hdel(storeKey, ...handles)
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
    const { parseToJSON, withValues } = options || ({} as GetOptions);
    if (withValues || typeof withValues === 'undefined') {
      const value = useHashmap
        ? await client.hget(storeKey, handle)
        : await client.get(`${storeKey}${storeDelimiter}${handle}`);
      return parseToJSON && typeof value === 'string' ? JSON.parse(value) : (value as Value);
    }
    return useHashmap
      ? (!!(await client.hexists(storeKey, handle)) as Value)
      : (!!(await client.exists(`${storeKey}${storeDelimiter}${handle}`)) as Value);
  }

  static getNodeList(host: string, port: number): { host: string; port: number }[] {
    const hostList = host.split(',');
    const portList = `${port}`.split(',');
    return hostList.map((hostAddress, hostIndex) => {
      return { host: hostAddress, port: parseInt(portList[hostIndex] || portList[0], 10) };
    });
  }

  // TODO: support scan from transaction data
  // TODO: optimize this method to reduce branches, ugly conidtional statements and repeatability
  async scan<Values = unknown[]>(handle: string, options: ScanOptions): Promise<{ cursor: number; values: Values }> {
    const { client, storeDelimiter, storeKey, useHashmap } = this;
    const { count, cursor: optCursor, parseToJSON, scanAll, withValues } = options;
    const getValues = typeof withValues === 'undefined' || withValues === true;
    const values: { field: string; value: string }[] = [];
    let cursor = 0;
    let keys: string[] = [];
    let parsedValues: unknown[] = [];
    if (scanAll) {
      if (useHashmap) {
        // TODO: remove repeating code
        while (true) {
          const [newCursor, newKeys] = await client.hscan(
            storeKey,
            cursor,
            'MATCH',
            handle,
            ...((typeof count !== 'undefined' ? ['COUNT', count] : []) as ['COUNT', number])
          );
          cursor = parseInt(newCursor, 10);
          if (getValues) {
            // TODO: remove repeating code
            for (const i in newKeys) {
              const key = newKeys[i];
              const value = await client.hget(storeKey, key);
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
      } else {
        // TODO: remove repeating code
        while (true) {
          const [newCursor, newKeys] = await client.scan(cursor, 'MATCH', `${storeKey}${storeDelimiter}${handle}`);
          cursor = parseInt(newCursor, 10);
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
      // TODO: remove repeating code
      if (useHashmap) {
        const [newCursor, newKeys] = await client.hscan(storeKey, optCursor || 0, 'MATCH', handle, 'COUNT', count);
        cursor = parseInt(newCursor, 10);
        // TODO: remove repeating code
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
      } else {
        const [newCursor, newKeys] = await client.scan(
          optCursor || 0,
          'MATCH',
          `${storeKey}${storeDelimiter}${handle}`,
          'COUNT',
          count
        );
        cursor = parseInt(newCursor, 10);
        // TODO: remove repeating code
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
        transactions[transactionId] = transaction.hset(this.storeKey, handle, valueToSet);
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
      result = await client.hset(storeKey, handle, valueToSet);
      // if (actualTTL) {
      //   await client.hexpire(storeKey, handle, actualTTL, 'NX');
      // // await client.expire(storeKey, actualTTL, 'NX');
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
