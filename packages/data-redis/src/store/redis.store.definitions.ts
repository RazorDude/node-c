export interface GetOptions {
  parseToJSON?: boolean;
  withValues?: boolean;
}

export interface RedisStoreModuleOptions {
  dataModuleName: string;
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
