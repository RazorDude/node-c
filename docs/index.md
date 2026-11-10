# NodeC Documentation

NodeC is a batteries-included NodeJS framework for developing Domain-Driven Design applications, built on top of NestJS.

This family of packages has 2 main goals:
- To speed up development as much as possible while maintaining high quality, and
- To provide a robust and standardized way of bulding back-end applications with Node and NestJS.

Node-C provides a clean, reliable and customizable back-end setup out of the box, at the cost of some opinionation.

You get to focus on building your project, instead of building the tools you need to build a project.


## Overview

Node-C levereges NestJS's module system to expose 3 types of modules and a range of services for each type. These types are:
- Data - where the code related to any kind of data processing lives. That includes modules for both permanent storage (such as databases) and cache (such as key-value stores).
- Domain - the modules here contain your business logic, split by domain. They work with the Data modules and with each other.
- Api - these modules expose different sets of endpoints for external communication. They trigger your business logic by working with the Domain modules, and do not have access to the Data modules.


## Table of Contents

- <a href='./Architecture/index.md' target='_blank'>Architecture</a>
  - <a href='./Architecture/overview.md' target='_blank'>Overview and request lifecycle</a>
  - <a href='./Architecture/configuration.md' target='_blank'>Configuration, startup and logging</a>
  - <a href='./Architecture/domain-services.md' target='_blank'>Domain services</a>
  - <a href='./Architecture/authentication.md' target='_blank'>Authentication (login methods, tokens, request authentication)</a>
  - <a href='./Architecture/access-control.md' target='_blank'>Access Control (permissions)</a>
  - <a href='./Architecture/core-utilities.md' target='_blank'>Core utilities (getNested, setNested, loadDynamicModules, httpRequest)</a>
- <a href='./API/index.md' target='_blank'>API</a>
  - <a href='./API/http-module.md' target='_blank'>HTTP API module (pipeline, middlewares, errors)</a>
  - <a href='./API/rest-controllers.md' target='_blank'>REST controllers</a>
- <a href='./Data/index.md' target='_blank'>Data</a>
  - <a href='./Data/entities.md' target='_blank'>Defining entities (TypeORM, Redis, ClickHouse) and migrations</a>
  - <a href='./Data/query-filters.md' target='_blank'>Query filters</a>
  - <a href='./Data/rdb.md' target='_blank'>Relational databases (RDB / TypeORM)</a>
  - <a href='./Data/clickhouse.md' target='_blank'>ClickHouse</a>
  - <a href='./Data/redis.md' target='_blank'>Redis / Valkey</a>
- <a href='./Testing/index.md' target='_blank'>Testing</a>
  - <a href='./Testing/e2e.md' target='_blank'>End-to-end tests</a>
- <a href='./ai-guide.md' target='_blank'>AI guide</a>
- <a href='./contributing.md' target='_blank'>Contributing</a>


## Packages

| Package                   | Purpose                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@node-c/core`            | Shared definitions, the base data and domain entity services, utilities (`getNested`, `setNested`, `loadDynamicModules`, ...), app startup, config and logging. |
| `@node-c/api-http`        | HTTP API module base, middlewares (CORS, request logging, authorization), access control and error handling.                                                    |
| `@node-c/api-rest`        | `RESTAPIEntityController` - default CRUD routes with DTO validation.                                                                                            |
| `@node-c/domain-iam`      | Authentication (local, OAuth2, federated, passthrough), tokens, users and the permissions system (`IAMAuthorizationService`).                                   |
| `@node-c/domain-iam-okta` | Okta authentication for `domain-iam`.                                                                                                                           |
| `@node-c/data-rdb`        | Base relational data layer: `RDBEntityService` and the `SQLQueryBuilderService` that turns filters into SQL.                                                    |
| `@node-c/data-typeorm`    | TypeORM implementation of the RDB layer (MySQL, PostgreSQL).                                                                                                    |
| `@node-c/data-clickhouse` | ClickHouse implementation of the RDB layer (read-oriented).                                                                                                     |
| `@node-c/data-redis`      | Redis/Valkey data layer, used as a cache or a primary store.                                                                                                    |
| `@node-c/nestjs-pino`     | Logging (an ESM build of `nestjs-pino`).                                                                                                                        |

The `apps/test` app is a full reference application that uses all of the packages, and is what the e2e test suite runs against.
