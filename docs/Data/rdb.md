# Relational Databases (RDB / TypeORM)

`@node-c/data-rdb` has the storage-agnostic RDB entity service (`RDBEntityService`) and the SQL query builder. `@node-c/data-typeorm` plugs TypeORM in as the implementation. The reference app uses MySQL for its main (`db`) and configs (`dbConfigs`) databases. To define an entity, see <a href='./entities.md' target='_blank'>Defining entities</a>.

&nbsp;

## Behaviour

- **Soft delete.** For entities with a deleted column (e.g. `deletedAt`), `delete` soft-deletes by default (`softDelete` defaults to `true`; pass `false` for a hard delete). Finds, counts and updates exclude soft-deleted rows unless the private option `withDeleted: true` is passed (not available through the REST API). Relation joins also exclude soft-deleted related rows, unless the relation is listed in `withDeletedPerRelation`.
- **Update and delete** require at least one filter (`At least one filter field for update is required.` / `... for deletion is required.`), and update also needs at least one field to update.
  - When the filters use relation fields, or `returnOriginalItems` is set, they first find the matching rows and then run the update/delete filtered by the found primary keys. If nothing matches, they return early with `count: 0` (and empty `items`/`originalItems`, if requested).
  - Otherwise, the update/delete runs directly with the parsed filters.
- **Errors.** Only some database errors are mapped to `ApplicationError`s with status 400:
  - `ER_DUP_ENTRY`, `ER_NO_DEFAULT_FOR_FIELD`, `ER_NO_REFERENCED_ROW` and `ER_NO_REFERENCED_ROW_2` → `[RBDEntityService][<CODE>]: <message>.`
  - Postgres unique violations → `<table>: <column> needs to be unique`
  - any other database error is rethrown as is, and becomes a 500 through the REST API.

&nbsp;

## Transactions

All RDB methods accept a `transactionManager` (a TypeORM `EntityManager`) in their options, and `forceTransaction: true` to open one if none is given. To run several operations in one transaction, open it once and pass the manager down:

```typescript
async update(data: DataDBUsersUpdateUserData, options: UpdateOptions): Promise<DataUpdateResult<DataDBUser>> {
  const { transactionManager } = options || {};
  if (!transactionManager) {
    return this.repository.manager.transaction((tm) => this.update(data, { ...(options || {}), transactionManager: tm }));
  }
  const updateResult = await TypeORMDBEntityService.prototype.update.call(this, data, options);
  // ... more queries with { transactionManager }
  return updateResult;
}
```

(From `apps/test/src/data/db/entities/users/users.service.ts`.) The protected `processManyToMany` helper syncs a many-to-many join table for a set of items, always inside a transaction.

&nbsp;

## Migrations and seeds

- Migrations live in `apps/test/src/data/<module>/migrations`, seeds in `apps/test/src/data/<module>/seeds/common`.
- Both run from `dist` and are ordered by their timestamp prefix, so a seed runs between the migrations around it. **Rebuild `apps/test` after changing either.**
- Generate the datasource files for an environment with `DATASOURCE_ENV=<env> MODULE_NAMES=<module> npm run generate:datasource-files:local`, then run `npm run typeorm:migration:run:<module>` (both in `apps/test`). See <a href='./entities.md' target='_blank'>Defining entities</a> for generating migrations.
