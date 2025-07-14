export interface GetOptions {
  parseToJSON?: boolean;
}

export interface RedisStoreModuleOptions {
  persistanceModuleName: string;
}

export interface ScanOptions {
  count?: number;
  cursor?: number;
  parseToJSON?: boolean;
  scanAll?: boolean;
  withValues?: boolean;
}

export interface SetOptions {
  transactionId?: string;
  ttl?: number;
}

export interface StoreDeleteOptions {
  transactionId?: string;
}
