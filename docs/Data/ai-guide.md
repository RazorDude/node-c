# AI Guide - Data

Checklists for working with the data layer. See the [main AI guide](../ai-guide.md) for the repo map and conventions.

## Key files

| Concern | File |
|---|---|
| Filters → SQL | `packages/data-rdb/src/sqlQueryBuilder/rdb.sqlQueryBuilder.service.ts` |
| RDB find/update/delete, error mapping | `packages/data-rdb/src/entity/rdb.entity.service.ts` |
| Option types (public and private) | `packages/core/src/data/entityService/data.entity.service.definitions.ts` |
| ClickHouse query builder | `packages/data-clickhouse/src/ormQueryBuilder/clickhouse.selectQueryBuilder.ts` |
| Redis lookups, schema handling | `packages/data-redis/src/repository/redis.repository.service.ts` |
| Redis keys, hashmap vs keys, TTL | `packages/data-redis/src/store/redis.store.service.ts` |
| Datasource/ormconfig generation | `packages/core/src/common/configProvider/configProvider.service.ts` (`generateOrmconfig`) |
| Entity examples (reference app) | `apps/test/src/data/db/entities/courses`, `apps/test/src/data/cache/entities/courses`, `apps/test/src/data/audit/entities/userLoginLogs` |

## Which storage supports what

| | RDB (TypeORM) | ClickHouse | Redis / Valkey |
|---|---|---|---|
| create / bulkCreate | yes | yes | yes |
| find / findOne / count | yes | yes | yes (by primary keys, or a scan) |
| update / delete | yes | no | yes, primary keys required by default |
| include (joins) | yes | no | no |
| soft delete | yes, if the entity has a deleted column | no | no |

## Before adding an entity

1. Follow the export name suffixes - `...Entity` (TypeORM schema), `...Module`, `...Service` - and export all of them from the data module's index file.
2. TypeORM: use `EntitySchema`, spread `DBEntitySchema.columns` for the shared columns, and give the entity a `name` - other entities' relations target it.
3. Redis: every primary key needs `primaryOrder`. Set `useHashmap: false` on the data module if items must expire.
4. ClickHouse: create the table yourself - there are no migrations - and list every column you filter or sort by in the schema.
5. Rebuild and generate the datasource files before generating a migration.

## Before writing a query or a filter

1. Every relation used in `filters`, `select` or `orderBy` must also be in `include`.
2. No `null` inside value arrays (`[null, 1]` throws, with or without `$or`). Combine separate filter objects instead: `{ $or: [{ field: null }, { field: [1, 2] }] }`.
3. `$between` takes exactly two values.
4. `withDeleted` is a private option - pass it as the second argument to the data service, not in the options.

## Before writing a migration or a seed

1. Read the later migrations - tables and columns have been renamed.
2. Use a timestamp later than everything the file depends on - migrations and seeds run together, in timestamp order.
3. No explanatory or numbering comments in the data.
4. Seed data is raw SQL and JSON columns are strings - escape backslashes twice in regexes (`\\\\.` in the TS source for `\.`).
5. Rebuild `apps/test` - migrations and seeds run from `dist`.

## Things that are easy to get wrong

- Cached data isn't invalidated by direct database changes (seeds, SQL) - flush Valkey or wait for the TTL.
- ClickHouse has no update or delete - a default delete route on ClickHouse data always fails.
- Access control can change `include` and `filters` before they reach the data layer - check the permission's input rules when results differ from the request.
