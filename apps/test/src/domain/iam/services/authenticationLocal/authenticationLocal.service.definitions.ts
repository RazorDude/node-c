import { CacheUser } from '../../../../persistance/cache';

export type IAMAuthenticationLocalUserFields = CacheUser & { password: string };
