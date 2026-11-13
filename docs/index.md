# NodeC Documentation
The human-built framework for the AI age.

Node-C is a batteries-included, AI-optimized NodeJS framework for developing Domain-Driven Design applications, built on top of NestJS.

This family of packages has 2 main goals:
- To speed up development as much as possible while maintaining high quality.
- To provide a robust and standardized way of building back-end applications with Node and NestJS.

Node-C provides a clean, reliable and customizable back-end setup out of the box.

Whether you're coding by hand or using AI, you get to focus on building your project, instead of spending time or tokens building the tools you need to build a project.

> [!TIP]
> **New here?** Build a working REST API in about 15 minutes with the [First steps](./first-steps.md) tutorial - it needs nothing but Node.js.


## Features

- **AI optimized** - detailed documentation and instructions for agents, so you can spin projects up quickly, without compromising on quality.
- **CRUD without boilerplate** - filtering with operators (`$like`, `$between`, `$or`, ...), relations, field selection, ordering, pagination and soft deletes on every entity.
- **Unified API across different storages** - RDBs (MySQL, PostgreSQL and SQLite (TypeORM)), ClickHouse and Redis/Valkey, all share the same data service interface. You get interchangeable storage services, with features like **cache-first reads** coming out of the box (read from Redis or Valkey, fall back to the database and fill the cache).
- **Authentication included** - email and password with 2FA, OAuth2/Okta with PKCE, and federated login through your own SSO app, with JWT access, refresh and id tokens.
- **Role-based and fine-grained permissions** - detailed roles and permissions system, which supports both simple role-based access, as well as granular permissions-based access control. You can mutate incoming request data, as well as outgoing response data, based on users' metadata and other complex conditions, stored in the database.
- **Robust configuration** - your apps are configured using a fully typed, rich configuration object, which provides deeply granular level of control. Support for overrides using config profiles (development, staging, production) come out of the box.
- **Full coverage via E2E tests** - the reference app's e2e suite runs real requests against real databases.


## Table of Contents

- [First steps](./first-steps.md) - build your first app
- [Overview](./Overview/index.md)
  - [Layers and modules](./Overview/layers.md)
  - [Controllers](./Overview/controllers.md)
  - [Domain services](./Overview/domain-services.md)
  - [Request lifecycle](./Overview/request-lifecycle.md)
- [Fundamentals](./Fundamentals/index.md)
  - [Configuration and startup](./Fundamentals/configuration.md)
  - [Logging](./Fundamentals/logging.md)
  - [Multiple data services](./Fundamentals/multiple-data-services.md)
  - [HTTP API module](./Fundamentals/http-module.md)
  - [Core utilities](./Fundamentals/core-utilities.md)
- [Data](./Data/index.md)
  - [Defining entities](./Data/entities.md)
  - [Query filters](./Data/query-filters.md)
  - [Relational databases](./Data/rdb.md)
  - [Redis / Valkey](./Data/redis.md)
  - [ClickHouse](./Data/clickhouse.md)
- [Security](./Security/index.md)
  - [Authentication](./Security/authentication.md)
  - [Access Control](./Security/access-control.md)
  - [API keys and CORS](./Security/api-keys-and-cors.md)
- [Recipes](./Recipes/index.md)
  - [Caching with Redis](./Recipes/caching.md)
  - [Audit logs with ClickHouse](./Recipes/audit-logs.md)
  - [Adding a permission](./Recipes/adding-a-permission.md)
  - [Seeding data](./Recipes/seeding-data.md)
  - [Logging in with Okta](./Recipes/okta-login.md)
  - [Federated login](./Recipes/federated-login.md)
- [Testing](./Testing/index.md)
  - [End-to-end tests](./Testing/e2e.md)
- [FAQ and troubleshooting](./faq.md)
- [Glossary](./glossary.md)
- [Migration guide](./migration-guide.md)
- [Contributing](./contributing.md)
- AI guides - for AI assistants building apps with NodeC: [main guide](./ai-guide.md), [Overview](./Overview/ai-guide.md), [Fundamentals](./Fundamentals/ai-guide.md), [Data](./Data/ai-guide.md), [Security](./Security/ai-guide.md), [Testing](./Testing/ai-guide.md)

## Packages

| Package                   | Purpose                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@node-c/core`            | Shared definitions, the base data and domain entity services, utilities (`getNested`, `setNested`, `loadDynamicModules`, ...), app startup, config and logging. |
| `@node-c/api-http`        | HTTP API module base, middlewares (CORS, request logging, authorization), access control and error handling.                                                    |
| `@node-c/api-rest`        | `RESTAPIEntityController` - default CRUD routes with DTO validation.                                                                                            |
| `@node-c/domain-iam`      | Authentication (local, OAuth2, federated, passthrough), tokens, users and the permissions system (`IAMAuthorizationService`).                                   |
| `@node-c/domain-iam-okta` | Okta authentication for `domain-iam`.                                                                                                                           |
| `@node-c/data-rdb`        | Base relational data layer: `RDBEntityService` and the `SQLQueryBuilderService` that turns filters into SQL.                                                    |
| `@node-c/data-typeorm`    | TypeORM implementation of the RDB layer (MySQL, PostgreSQL, SQLite).                                                                                            |
| `@node-c/data-clickhouse` | ClickHouse implementation of the RDB layer (read-oriented).                                                                                                     |
| `@node-c/data-redis`      | Redis/Valkey data layer, used as a cache or a primary store.                                                                                                    |
| `@node-c/nestjs-pino`     | Logging (an ESM build of `nestjs-pino`).                                                                                                                        |

The `apps/test` app is a full reference application that uses all of the packages, and is what the e2e test suite runs against. The `apps/first-steps` app is the one built in the [First steps](./first-steps.md) tutorial.

---

Next: [First steps](./first-steps.md)
