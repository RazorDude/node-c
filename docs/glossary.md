# Glossary

The terms these docs use, in alphabetical order.

| Term | Meaning |
|---|---|
| **Access control** | Deciding whether a logged-in user may call a route, and with what input. Done by the access control interceptor using [permissions](./Security/access-control.md). |
| **Additional data service** | A data service a domain service can use besides its main one, under a name - e.g. `cache`. See [Multiple data services](./Fundamentals/multiple-data-services.md). |
| **Anonymous route** | A route listed in `anonymousAccessRoutes` - callable without a token, and skipped by access control. |
| **API module** | A NestJS module extending `HTTPAPIModule`: one set of controllers plus the request pipeline. Each app module has exactly one. See [HTTP API module](./Fundamentals/http-module.md). |
| **App module** | The NestJS module passed to `NodeCApp.start`, importing the config, logger, data, domain and API modules. One app module is one NestJS application. |
| **Auth service** | One login method - `userLocal`, `okta`, `passthrough`, a consumer - registered in the authentication manager under its `authType`. See [Authentication](./Security/authentication.md). |
| **Consumer / provider** | In a federated login, the consumer app forwards logins to the provider (SSO) app and uses its tokens. See [Federated login](./Recipes/federated-login.md). |
| **Data entity service (data service)** | The service that reads and writes one entity in one storage - e.g. `DataDBTasksService`. The data layer's public face. |
| **Data module** | A module that connects to one storage and registers its entity modules - e.g. `DataDBModule`, configured under `config.data.<name>`. |
| **Domain entity service (domain service)** | The service with an entity's business logic, built on one or more data services - e.g. `DomainTasksService`. See [Domain services](./Overview/domain-services.md). |
| **Domain module** | A global module that registers a set of domain services. |
| **Entity** | The schema of a stored item: a TypeORM `EntitySchema`, a Redis `EntitySchema` or a ClickHouse schema. See [Defining entities](./Data/entities.md). |
| **Entity module** | A module that registers the repository for one entity and provides its data service. |
| **First service** | The first entry in `dataServices` for a call - its result is the call's `result`. |
| **Id token** | The JWT issued at login that carries the user and their permissions - the source of `req.locals.user`. |
| **Index file** | A file that re-exports everything in a folder (`db.entities.ts`, `tasks.services.ts`), read by `loadDynamicModules`. |
| **Main data service** | A domain service's first constructor argument - `'main'` in `dataServices`. |
| **Module name** | The key a module's config lives under (`config.data.db`, `config.api.tasks`) and its name in `register(...)`. For permissions, the API module's `ACCESS_CONTROL_MODULE_NAME`. |
| **Permission** | A rule giving a role access to resources in a resource context, optionally with fine-grained input and output rules. |
| **Private options** | The second options argument of data and domain methods (`withDeleted`, `requirePrimaryKeys`, ...) - for code only, never filled from a request. |
| **Profile** | The per-environment part of the config - `appConfigProfile<Env>`. See [Configuration](./Fundamentals/configuration.md). |
| **Reference app** | `apps/test` - the full example app the e2e tests run against. |
| **Resource** | What a permission covers within a resource context - by default, the controller handler's name (`find`, `findOne`, ...). |
| **Resource context** | The controller a permission applies to - its `@AccessControlContext` value, or its class name. |
| **Soft delete** | Setting `deletedAt` instead of removing the row. The default for RDB entities with a deleted column. |

---

Previous: [FAQ and troubleshooting](./faq.md) · Next: [Migration guide](./migration-guide.md)
