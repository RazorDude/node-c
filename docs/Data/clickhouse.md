# ClickHouse

`@node-c/data-clickhouse` is meant for append-mostly data such as audit logs. In the reference app, it stores `userLoginLogs` in the audit database. `ClickHouseDBEntityService` extends the RDB entity service, so filters work the same way (see <a href='./query-filters.md' target='_blank'>Query filters</a>). To define an entity, see <a href='./entities.md' target='_blank'>Defining entities</a>.

&nbsp;

## Supported operations

- `create`/`bulkCreate` (inserts through the client's `insert`), `find`, `findOne`, `count`
- Not implemented: `select`, `leftJoinAndSelect` (so no `include`), `update`, `delete`, `softDelete`. Calling them throws `Method ClickHouseSelectQueryBuilder.<name> not implemented.` (400 through the REST API).

&nbsp;

## Queries

- Filter values are sent as typed `query_params` (`{name:Type}` placeholders), never interpolated into the SQL.
- Parameter names are validated against a safe pattern.
- `orderBy` fields are checked against the entity's schema columns.
- `skip`/`take` (from `page`/`perPage`) must be non-negative integers.
