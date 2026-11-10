# Working with NodeC - Guide for AI Assistants (and Humans)

A condensed map of the repository, its conventions and the mistakes that are easy to make. Read this first, then the AI guide of the section you're working in ([Overview](./Overview/ai-guide.md), [Fundamentals](./Fundamentals/ai-guide.md), [Data](./Data/ai-guide.md), [Security](./Security/ai-guide.md), [Testing](./Testing/ai-guide.md)), and the topic pages linked below.

## Repository map

```
packages/
  core              - app bootstrap, config, domain entity service, data entity service base classes, loadDynamicModules
  api-http          - authorization middleware, access control + error interceptors, HTTP module base
  api-rest          - RESTAPIEntityController and its DTOs
  domain-iam        - authentication, authorization (permissions), users, tokens
  domain-iam-okta   - Okta-based authentication
  data-rdb          - storage-agnostic RDB entity service + SQL query builder
  data-typeorm      - TypeORM implementation of data-rdb (MySQL, PostgreSQL, SQLite)
  data-clickhouse   - ClickHouse entity service (audit-style data)
  data-redis        - Redis/Valkey entity service (cache, auth data)
  nestjs-pino       - logging
apps/first-steps    - the smallest complete app (SQLite, no IAM) - built in docs/first-steps.md
apps/test           - the reference app, used by the e2e tests
  src/api/<module>/controllers      - coursePlatformDelegated, coursePlatformFederated, coursePlatformStandalone, sso
  src/domain/<module>/services      - one domain service per entity, plus iam
  src/data/<module>/entities        - db, dbConfigs (MySQL), audit (ClickHouse), cache* (Valkey)
  src/data/<module>/migrations, seeds/common
  test/e2e                          - numbered e2e spec files + common helpers
test/               - vitest config and global setup
docs/               - this documentation: Overview, Fundamentals, Data, Security, Recipes, Testing
                      (+ first-steps, faq, glossary, migration-guide); VitePress config in docs/.vitepress
```

## Conventions

- **Files** are named `<entity>.<kind>.ts` - `courses.entity.ts`, `courses.module.ts`, `courses.service.ts`, `courses.controller.ts`.
- **Types and interfaces** go in a `<name>.definitions.ts` file next to the code that uses them.
- **Index files.** Every entities/services/controllers folder has an index file (`db.entities.ts`, `coursePlatformDelegated.services.ts`, `coursePlatformDelegated.controllers.ts`) that re-exports everything in it. Modules are built with `loadDynamicModules(FolderData)` from these exports - **a class that isn't exported from the index file isn't registered**, and neither is one whose export name doesn't end with `Module`, `Entity`, `Service` or `Controller` (see [Core utilities](./Fundamentals/core-utilities.md)).
- **Imports** use the `.js` extension (ESM).
- No `any` in TypeScript.

## Recipes

### Add an entity end to end

1. **Data** - in `apps/test/src/data/<module>/entities/<entity>/`, add the entity, module and service (see [Defining entities](./Data/entities.md) for each storage, or copy an existing entity, e.g. `db/entities/courses`). The module registers the repository (e.g. `TypeORMDBRepositoryModule.register({ connectionName, entityClass, dataModuleName })`) and provides/exports the service. Export all three from the module's entities index file (e.g. `db.entities.ts`) - the data module (`DataDBModule`) registers everything it exports.
2. **Schema** - add a migration in `src/data/<module>/migrations` (or, for ClickHouse, the table creation - see [ClickHouse](./Data/clickhouse.md)).
3. **Domain** - add a domain entity service in `src/domain/<apiModule>/services/<entity>/` and export it from the services index file. Do this for every domain module that needs it. See [Domain services](./Overview/domain-services.md) for overriding and adding methods.
   ```typescript
   @Injectable()
   export class DomainCoursePlatformDelegatedCoursesService extends DomainEntityService<
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
       // (main data service, enabled methods - undefined for all, logger, additional data services)
       super(dataEntityService, undefined, logger, { cache });
     }
   }
   ```
4. **API** - add a controller extending `RESTAPIEntityController` in `src/api/<apiModule>/controllers/<entity>/`, and export it from the controllers index file.
   ```typescript
   @AccessControlContext('CoursePlatformUserLoginLogsEntityController')
   @Injectable()
   @Controller('userLoginLogs')
   export class APICoursePlatformDelegatedUserLoginLogsEntityController extends RESTAPIEntityController<
     DataAuditUserLoginLog,
     DomainCoursePlatformDelegatedUserLoginLogsService
   > {
     constructor(
       domainEntityService: DomainCoursePlatformDelegatedUserLoginLogsService,
       logger: LoggerService,
       reflector: Reflector
     ) {
       // (domain service, DTOs, logger, reflector, enabled routes - omit for all routes with a DTO)
       super(domainEntityService, RESTAPIEntityController.getDefaultDtos<DataAuditUserLoginLog>(), logger, reflector, ['delete', 'find']);
     }
   }
   ```
5. **Permissions** - add permissions for the new controller context and handlers in a seed, and assign them to roles. Without them, every non-admin request gets a 403.
6. **Rebuild** `apps/test` and add e2e tests.

### Add a seed

1. Read the later migrations first - tables were renamed (e.g. `authorizationPoints` → `permissions`, `userTypes` → `roles`, `userTypeAuthorizationPoints` → `rolePermissions`, `userTypeAssignedUsers` → `userAssignedRoles`).
2. Create `src/data/<module>/seeds/common/<timestamp>-<Name>.ts` with a timestamp **later than the migrations and seeds it depends on** - seeds and migrations run together in timestamp order.
3. Keep the data free of explanatory or numbering comments.
4. **Rebuild `apps/test`** - seeds run from `dist`.

### Add a permission

See [Access Control](./Security/access-control.md). In short: pick the id order deliberately, anchor regexes, start input paths with `body`/`headers`/`params`/`query`, and make sure the user relations it uses are loaded.

## Pitfalls

| Symptom | Likely cause |
|---|---|
| 404 on a route that exists | The route isn't enabled - no DTO passed, or it's missing from `defaultRouteMethods` |
| Status code lost when throwing | `HttpException` thrown with a string response - pass `{ message, statusCode }` |
| 403 `{ error: 'Forbidden', statusCode: 403 }` | Access control denied the request. Check the log for the error code |
| 403 for a user with an assigned resource | The user relation is empty or not loaded (`userFieldName` value is `undefined`), or the user object is stale (cache/token) |
| A permission allows too much | Unanchored regex, or an input path that never exists (e.g. `query.params.id`) gets set from the user value |
| A forbidden include removes all includes | `forbiddenInputData` clears the whole field by design |
| Nested filters ignored in the query string | `qs` only parses 5 levels deep |
| `Forbidden include item` | A relation used in `filters`/`select`/`orderBy` isn't in `include` |
| `Method ClickHouseSelectQueryBuilder.X not implemented.` | ClickHouse doesn't support updates, deletes or joins |
| `The primary key field X is required ...` (Redis) | Redis update/delete need the primary key filters |
| Seed/migration change has no effect | `apps/test` wasn't rebuilt |
| An e2e test passes alone but fails in the suite (or vice versa) | Earlier files changed the shared data - compare with the admin's result instead of hardcoded values |
| A new entity, module or service isn't found by Nest | Not exported from the index file, or the export name lacks the `Module`/`Entity`/`Service`/`Controller` suffix |
| `create` with `dataServices: ['main', 'cache']` doesn't write to the cache | Additional services are skipped when the first one returned a result - pass `runOnNoFirstServiceResultOnly: false` for the cache |
| Redis items never expire | `useHashmap` is `true` (the default) - TTLs only apply with `useHashmap: false` |
| A config value is `undefined` | Missing `<CATEGORY>_<MODULE>_MODULE_TYPE` env variable, or the module isn't in `envKeysParentNames` |
| A numeric config value behaves like a string | Values from the environment are strings - parse them |
| Permission/role changes have no effect for a logged-in user | The user is taken from the id token issued at login - log in again (and mind the users cache) |
| An empty 401 | The authorization middleware rejected the request (no/expired token, or a route not in `anonymousAccessRoutes`) - also for unknown routes |
| `Authentication failed.` | Any login failure - the reason is only in the logs |

## Where to go next

- [Layers](./Overview/layers.md), [Request lifecycle](./Overview/request-lifecycle.md), [Multiple data services](./Fundamentals/multiple-data-services.md)
- [First steps](./first-steps.md) - the minimal app, file by file
- [Configuration](./Fundamentals/configuration.md), [Logging](./Fundamentals/logging.md)
- [Domain services](./Overview/domain-services.md)
- [Authentication](./Security/authentication.md), [Access Control](./Security/access-control.md)
- [Core utilities](./Fundamentals/core-utilities.md)
- [HTTP API module](./Fundamentals/http-module.md), [Controllers](./Overview/controllers.md)
- [API keys and CORS](./Security/api-keys-and-cors.md)
- [Recipes](./Recipes/index.md) - caching, audit logs, permissions, seeds, Okta, federated login
- [FAQ](./faq.md), [Glossary](./glossary.md), [Migration guide](./migration-guide.md)
- [Defining entities](./Data/entities.md), [Query filters](./Data/query-filters.md), [RDB](./Data/rdb.md), [ClickHouse](./Data/clickhouse.md), [Redis](./Data/redis.md)
- [End-to-end tests](./Testing/e2e.md)
- [Contributing](./contributing.md) - building and checking the monorepo
