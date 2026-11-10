# Node-C
A batteries-included NodeJS framework for developing Domain-Driven Design applications, built on top of NestJS.

This family of packages has 2 main goals:
- To speed up development as much as possible while maintaining high quality, and
- To provide a robust and standardized way of building back-end applications with Node and NestJS.

Node-C provides a clean, reliable and customizable back-end setup out of the box, at the cost of being opinionated.

You get to focus on building your project, instead of building the tools you need to build a project.


## Overview
Node-C leverages NestJS's module system to expose 3 types of modules and a range of services for each type. These types are:
- Data - where the code related to any kind of data processing lives. That includes modules for both permanent storage (such as databases) and cache (such as key-value stores).
- Domain - the modules here contain your business logic, split by domain. They work with the Data modules and with each other.
- Api - these modules expose different sets of endpoints for external communication. They trigger your business logic by working with the Domain modules, and do not have access to the Data modules.


## Documentation
The full documentation is in the [docs](docs/index.md) folder. It can also be run as a local site with search: `npm run docs:dev`.
- [First steps](docs/first-steps.md) - build your first app in about 15 minutes
- [Overview](docs/Overview/index.md) - layers, controllers, domain services and the request lifecycle
- [Fundamentals](docs/Fundamentals/index.md) - configuration, logging, multiple data services and the HTTP API module
- [Data](docs/Data/index.md) - entities, query filters, relational databases, Redis and ClickHouse
- [Security](docs/Security/index.md) - authentication, access control, API keys and CORS
- [Recipes](docs/Recipes/index.md) - caching, audit logs, permissions, seeds, Okta and federated login
- [FAQ](docs/faq.md), [Migration guide](docs/migration-guide.md) and [Contributing](docs/contributing.md)


## Getting Started
The quickest start is the [First steps](docs/first-steps.md) tutorial - a task-list API on SQLite, which needs nothing but Node.js 22+. Its finished code is in `apps/first-steps`:

```bash
git clone https://github.com/RazorDude/node-c
cd node-c
npm install
npm run build:clean:all
cd apps/first-steps
npm run generate:datasource-files
npm run migration:run
npm start
```

You should now have a server running at http://localhost:3000. Try it:
```bash
curl -X POST localhost:3000/tasks -H 'content-type: application/json' -d '{"data":{"title":"Try NodeC"}}'
curl localhost:3000/tasks
```

For a full app with MySQL, ClickHouse, Redis/Valkey, logins and permissions, see the reference app in `apps/test` and its [end-to-end tests](docs/Testing/e2e.md).
