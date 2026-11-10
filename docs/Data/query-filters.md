# Query Filters

All data entity services accept the same options for find, findOne, count, update and delete. The RDB implementation is in `SQLQueryBuilderService` (`@node-c/data-rdb`). The other storages support a subset (see <a href='./clickhouse.md' target='_blank'>ClickHouse</a> and <a href='./redis.md' target='_blank'>Redis</a>).

&nbsp;

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

&nbsp;

## Other options

- `include: string[]` - relations to join, e.g. `['courseType', 'lessons.lessonType']`. Soft-deleted related rows are left out of the join.
- `select: string[]` - fields to return. Relation fields need the relation in `include`.
- `orderBy: { field: 'ASC' | 'DESC' }` - the direction isn't case-sensitive. Relation fields need the relation in `include`.
- `page` (default 1) and `perPage` (default 10) - find only. The result is `{ items, page, perPage, more, totalCount? }`.
- `findAll: boolean` - find only, ignores pagination.
- `individualSearch: boolean` - find only, Redis-specific (see <a href='./redis.md' target='_blank'>Redis</a>).

Soft-deleted rows are excluded by default. `withDeleted` is a *private* option - only code calling the data service can pass it, not the REST API.
