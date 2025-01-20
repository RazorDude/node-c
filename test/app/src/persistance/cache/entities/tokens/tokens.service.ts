import { RedisEntityService } from '@node-c/persistance/redis';

import { CacheToken } from './tokens.entity';

export class CacheTokensEntityService extends RedisEntityService<CacheToken> {}
