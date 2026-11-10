# Seeding Data

Seeds put initial data - roles, permissions, lookup tables, test users - into a relational database. In NodeC, seeds are TypeORM migrations that live in a separate folder, so they run with `migration:run`, in order with the schema migrations, on every environment.

## 1. Create the seed file

```
src/data/<dataModule>/seeds/common/<timestamp>-<Name>.ts
```

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskStatuses1780000000001 implements MigrationInterface {
  name = 'TaskStatuses1780000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO `taskStatuses` (`id`, `name`) VALUES (1, 'open'), (2, 'done');"
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
```

The class name must end with the timestamp, and `name` must match it - TypeORM uses them to track which migrations have run.

> [!WARNING]
> Use a timestamp **later** than the migrations the seed depends on. Seeds and migrations run together, ordered by timestamp, so a seed with an older timestamp runs before the table it inserts into exists.

> [!WARNING]
> Read the later migrations before writing SQL - tables and columns get renamed over time (e.g. the reference app's `authorizationPoints` became `permissions`).

## 2. Rebuild and run

The generated datasource file loads migrations and seeds from `dist`, so build first:

```bash
npm run build
DATASOURCE_ENV=local npm run generate:datasource-files   # only needed once per environment
npx typeorm migration:run -d datasource-db-local.js
```

> [!TIP]
> JSON columns are inserted as strings, so escape backslashes twice in regular expressions inside them: `\\\\.` in the TypeScript source becomes `\.` in the stored JSON.

The reference app's seeds are in `apps/test/src/data/db/seeds/common` - the initial data, categories and the permission data the e2e tests rely on.

---

Previous: [Adding a permission](./adding-a-permission.md) · Next: [Logging in with Okta](./okta-login.md)
