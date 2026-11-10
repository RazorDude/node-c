# Query Filters

All data entity services accept the same options for find, findOne, count, update and delete. The RDB implementation is in `SQLQueryBuilderService` (`@node-c/data-rdb`). The other storages support a subset (see [ClickHouse](./clickhouse.md) and [Redis](./redis.md)).

## Filters

```typescript
filters: {
  courseTypeId: 1,                       // equality
  id: [1, 2, 3],                         // simple array - IN
  description: null,                     // IS NULL
  deletedAt: { $not: null },             // IS NOT NULL
  name: { $like: '%intro%' },
  createdAt: { $between: ['2025-01-01', '2025-12-31'] },
  'courseType.name': 'Free',             // relation field - the relation must also be in include
  $or: [{ courseTypeId: 1 }, { id: [4] }],
  updatedAt: { $not: { $lt: '2025-01-01' } }
}
```

Operators:
- `$eq`, `$gt`, `$gte`, `$lt`, `$lte`
- `$like`, `$ilike`
- `$between` - exactly 2 values, otherwise `Invalid params count`
- `$contains` - checks whether a JSON column contains the given string
- `$not` - allowed with `null`, a simple array (`NOT IN`), `$like`, `$ilike`, `$between`, `$gt`, `$gte`, `$lt`, `$lte` and `$contains`. Anything else throws.
- `$and`, `$or` - combine filter objects. A top-level `$or` is wrapped in brackets, so it doesn't escape the other conditions.

Rules:
- Arrays of primitive values (and dates) are treated as `IN`. Arrays with complex values are combined with `OR`.
- `null` is allowed as a direct value (`IS NULL`), but **not inside a simple array** (`cannot contain null values`).
- Array items that are `undefined` are skipped, and a simple array with no values left is ignored.
- Filters can be nested at most 10 levels deep (`Max depth of 10 exceeded`). Through the REST query string, `qs` limits this further to 5.
- Filters, `orderBy` and `select` on `relation.field` join the relation automatically, but the relation must also be in `include`, otherwise the request fails with `Forbidden include item`.

## Other options

- `include: string[]` - relations to join, e.g. `['courseType', 'lessons.lessonType']`. Soft-deleted related rows are left out of the join.
- `select: string[]` - fields to return. Relation fields need the relation in `include`.
- `orderBy: { field: 'ASC' | 'DESC' }` - the direction isn't case-sensitive. Relation fields need the relation in `include`.
- `page` (default 1) and `perPage` (default 10) - find only. The result is `{ items, page, perPage, more, totalCount? }`.
- `findAll: boolean` - find only, ignores pagination.
- `individualSearch: boolean` - find only, Redis-specific (see [Redis](./redis.md)).

Soft-deleted rows are excluded by default. `withDeleted` is a *private* option - only code calling the data service can pass it, not the REST API.

> [!WARNING]
> Through the REST API, filters come from the query string, so their values are strings and `qs` only parses 5 levels deep. A relation used in `filters`, `select` or `orderBy` that isn't in `include` fails with `Forbidden include item`.

> [!TIP]
> Access control can add to, narrow or remove `filters` and `include` before they reach the data layer. When results differ from what the request asked for, check the permission's input rules (see [Access Control](../Security/access-control.md)).

---

Previous: [Defining entities](./entities.md) · Next: [Relational databases](./rdb.md)
