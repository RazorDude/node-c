import { RedisRepositoryService } from '@node-c/persistance/redis';

import { CacheToken } from './tokens.entity';

export class CacheTokensEntityRepositoryService extends RedisRepositoryService<CacheToken> {}
