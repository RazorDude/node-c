import { RedisClientType } from 'redis';

export interface GetOptions {
  parseToJSON?: boolean;
}

export type RedisClientScanMethod = (
  _key: string,
  _cursor: number,
  _options?: { count?: number; match: string }
) => Promise<{ cursor: number; keys?: string[]; tuples?: { field: string; value: string }[] }>;

export interface RedisStoreModuleOptions {
  persistanceModuleName: string;
}

export type RedisTransaction = ReturnType<RedisClientType['multi']>;

export interface ScanOptions {
  count?: number;
  cursor?: number;
  parseToJSON?: boolean;
  scanAll?: boolean;
  withValues?: boolean;
}

export interface SetOptions {
  transactionId?: string;
}

export interface StoreDeleteOptions {
  transactionId?: string;
}
