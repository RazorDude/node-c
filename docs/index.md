# NodeC Documentation

NodeC is a batteries-included NodeJS framework for developing Domain-Driven Design applications, built on top of NestJS.

This family of packages has 2 main goals:
- To speed up development as much as possible while maintaining high quality, and
- To provide a robust and standardized way of building back-end applications with Node and NestJS.

NodeC provides a clean, reliable and customizable back-end setup out of the box, at the cost of being opinionated.

You get to focus on building your project, instead of building the tools you need to build a project.

> [!TIP]
> **New here?** Build a working REST API in about 15 minutes with the [First steps](./first-steps.md) tutorial - it needs nothing but Node.js.

## What you write, and what you get

Three small classes - an entity, a domain service and a controller:

```typescript
export const DataDBTaskEntity = new EntitySchema<DataDBTask>({
  columns: { ...DBEntitySchema.columns, done: { type: 'boolean', default: false }, title: { type: 'varchar' } },
  name: 'task',
  tableName: 'tasks'
});

export class DomainTasksService extends DomainEntityService<DataDBTask, DataDBTasksService> {
  constructor(dataEntityService: DataDBTasksService, logger: LoggerService) {
    super(dataEntityService, undefined, logger);
  }
}

@Controller('tasks')
export class APITasksEntityController extends RESTAPIEntityController<DataDBTask, DomainTasksService> {
  constructor(domainEntityService: DomainTasksService, logger: LoggerService, reflector: Reflector) {
    super(domainEntityService, RESTAPIEntityController.getDefaultDtos<DataDBTask>(), logger, reflector);
  }
}
```

...and a complete, validated REST API for them:

```bash
curl -X POST localhost:3000/tasks -H 'content-type: application/json' -d '{"data":{"title":"Try NodeC"}}'
curl -g 'localhost:3000/tasks?filters[title][$like]=%25NodeC%25&orderBy[createdAt]=desc&page=1&perPage=20'
curl -X PATCH localhost:3000/tasks -H 'content-type: application/json' -d '{"data":{"done":true},"filters":{"id":1}}'
```

## Features

- **CRUD without boilerplate** - filtering with operators (`$like`, `$between`, `$or`, ...), relations, field selection, ordering, pagination and soft deletes on every entity.
- **Several storages, one API** - MySQL, PostgreSQL and SQLite (TypeORM), ClickHouse and Redis/Valkey, all behind the same data service interface.
- **Cache-first reads in one option** - read from Redis, fall back to the database and fill the cache, without writing that logic yourself.
- **Logins included** - email and password, OAuth2/Okta with PKCE, and federated login through your own SSO app, with JWT access, refresh and id tokens.
- **Role-based and fine-grained permissions** - per route, plus rules on what a user may ask for and see, stored in the database.
- **Config from files and the environment** - one config object for every module, with per-environment profiles and secrets kept out of code.
- **Tested end to end** - the reference app's e2e suite runs real requests against real databases.

## Overview

NodeC leverages NestJS's module system to expose 3 types of modules and a range of services for each type. These types are:
- Data - where the code related to any kind of data processing lives. That includes modules for both permanent storage (such as databases) and cache (such as key-value stores).
- Domain - the modules here contain your business logic, split by domain. They work with the Data modules and with each other.
- Api - these modules expose different sets of endpoints for external communication. They trigger your business logic by working with the Domain modules, and do not have access to the Data modules.

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
