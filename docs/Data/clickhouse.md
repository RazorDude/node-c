# ClickHouse

`@node-c/data-clickhouse` is meant for append-mostly data such as audit logs. In the reference app, it stores `userLoginLogs` in the audit database. `ClickHouseDBEntityService` extends the RDB entity service, so filters work the same way (see [Query filters](./query-filters.md)). To define an entity, see [Defining entities](./entities.md).

## Supported operations

- `create`/`bulkCreate` (inserts through the client's `insert`), `find`, `findOne`, `count`
- Not implemented: `select`, `leftJoinAndSelect` (so no `include`), `update`, `delete`, `softDelete`. Calling them throws `Method ClickHouseSelectQueryBuilder.<name> not implemented.` (400 through the REST API).

## Queries

- Filter values are sent as typed `query_params` (`{name:Type}` placeholders), never interpolated into the SQL.
- Parameter names are validated against a safe pattern.
- `orderBy` fields are checked against the entity's schema columns.
- `skip`/`take` (from `page`/`perPage`) must be non-negative integers.

> [!WARNING]
> There are no updates or deletes. A default `DELETE` route on ClickHouse-backed data always fails - leave it out of the controller's DTOs or `defaultRouteMethods`.

> [!TIP]
> ClickHouse tables aren't created by migrations - create them yourself (the e2e global setup does it with plain SQL). See the [Audit logs recipe](../Recipes/audit-logs.md) for a complete example.

---

Previous: [Redis / Valkey](./redis.md) · Next: [Authentication](../Security/authentication.md)
