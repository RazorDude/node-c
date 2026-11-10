# Caching with Redis

Put a Redis/Valkey cache in front of a database table, so repeated reads don't hit the database. NodeC does the "cache first, then the database, then fill the cache" logic for you - you only add a second data service and choose it per call.

The reference app caches courses this way: `apps/test/src/data/cache` and `apps/test/src/domain/coursePlatformDelegated/services/courses`.

## 1. Add a Redis data module

```typescript
// src/data/cache/cache.module.ts
@Module({})
export class DataCacheModule extends RedisModule {
  static register(): DynamicModule {
    return RedisModule.register({ folderData: FolderData, moduleClass: DataCacheModule, moduleName: 'cache' });
  }
}
```

```typescript
// config.common.ts
data: {
  cache: { defaultTTL: 3600, storeKey: 'store-cache', type: NoSQLType.Redis, useHashmap: false }
}
```

```bash
# env file
DATA_CACHE_MODULE_TYPE=NOSQL
DATA_CACHE_HOST=localhost
DATA_CACHE_PORT=6379
DATA_CACHE_PASSWORD=
```

Import `DataCacheModule.register()` in the app module, and add `CACHE: 'cache'` to `envKeysParentNames.DATA` (see [Configuration](../Fundamentals/configuration.md#environment-variables)).

> [!WARNING]
> Keep `useHashmap: false` for caches - with the default `true`, items never expire (see [Redis / Valkey](../Data/redis.md#how-items-are-stored)).

## 2. Add the cache entity

```typescript
// src/data/cache/entities/courses/courses.entity.ts
const defaultSchema = getDefaultEntitySchema(EntitySchemaColumnType.Integer, 'course');

export type DataCacheCourse = RedisEntity<number> & DataDBCourse;
export const DataCacheCourseSchema: EntitySchema = {
  ...defaultSchema,
  columns: { ...defaultSchema.columns, name: { type: EntitySchemaColumnType.String } }
};
```

Plus the entity module (`RedisRepositoryModule.register({ dataModuleName: 'cache', schema: DataCacheCourseSchema })`) and the `RedisEntityService` - see [Defining entities](../Data/entities.md#redis-and-valkey).

## 3. Give the domain service both data services

```typescript
@Injectable()
export class DomainCoursesService extends DomainEntityService<
  DataDBCourse,
  DataDBCoursesService,
  DomainEntityServiceDefaultData<DataDBCourse>,
  { cache: DataCacheCoursesEntityService }
> {
  constructor(
    protected cache: DataCacheCoursesEntityService,
    dataEntityService: DataDBCoursesService,
    logger: LoggerService
  ) {
    super(dataEntityService, undefined, logger, { cache });
  }
}
```

## 4. Read cache-first

```typescript
const { result } = await coursesService.findOne({
  filters: { id },
  dataServices: ['cache', 'main'],
  saveAdditionalResultsInFirstService: { serviceName: 'main', useResultsForFirstServiceReturnData: true }
});
```

The cache is asked first. If it has nothing, the database is asked, and what it found is saved in the cache and returned.

The same options work from the REST API - with a find DTO that supports them (`FindOneWithSaveAddtionalOptionsDto`):

```bash
curl -g 'localhost:2070/courses/item/5?dataServices[]=cache&dataServices[]=main&saveAdditionalResultsInFirstService[serviceName]=main&saveAdditionalResultsInFirstService[useResultsForFirstServiceReturnData]=true'
```

## 5. Keep the cache up to date on writes

```typescript
await coursesService.update(data, {
  filters: { id },
  dataServices: ['main', 'cache']
});
```

`update` and `delete` run on the cache when the database changed something. `create` doesn't by default - pass `optionsOverridesByService: { cache: { runOnNoFirstServiceResultOnly: false } }` (see [Multiple data services](../Fundamentals/multiple-data-services.md#how-each-method-uses-the-additional-services)).

> [!TIP]
> Redis needs the primary keys for updates and deletes. If the database update filters by something else, add `filterByFirstServiceResultFields: { id: 'id' }` and `runOnNoFirstServiceResultOnly: false` to the cache's overrides, so the cache is filtered by the ids the database updated.

---

Previous: [Recipes](./index.md) · Next: [Audit logs with ClickHouse](./audit-logs.md)
