# First Steps
In this tutorial, you'll build a small task-list API. You'll see the basics of NodeC's 3-layer architecture: a data layer with SQLite, a domain layer for the business logic and an API layer with REST routes to create, list, filter, update and delete tasks. It takes about 15 minutes, and needs nothing but Node.js.

Along the way you'll write one class per [layer](./Overview/layers.md) - an entity in the data layer, a service in the domain layer and a controller in the API layer - and see what NodeC gives you for them.

> [!NOTE]
> This tutorial is written for NodeC **1.0.0-beta9**. The finished app is in the repository at [`apps/first-steps`](https://github.com/RazorDude/node-c/tree/master/apps/first-steps) - you can run it from there instead of creating a new project (see [Running the premade finished app](#running-the-premade-finished-app)).


## Prerequisites

- Node.js 22 or later, and npm
- A terminal with `curl`, to try the API


## 1. Create the project

```bash
mkdir my-tasks && cd my-tasks
npm init -y
npm pkg set type=module
npm install @nestjs/common @nestjs/core @node-c/core @node-c/api-http @node-c/api-rest @node-c/data-rdb @node-c/data-typeorm \
  better-sqlite3 class-transformer class-validator cookie-parser express rxjs typeorm
npm install --save-dev typescript
```

`better-sqlite3` installs a native binding when it's installed. If npm reports that its install script was blocked, approve it and build it:

```bash
npm install-scripts approve better-sqlite3
npm rebuild better-sqlite3
```

Add a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "target": "esnext"
  },
  "include": ["src"]
}
```

And these scripts to `package.json`:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/main.js",
  "generate:datasource-files": "DATASOURCE_ENV=${DATASOURCE_ENV:-local} MODULE_NAMES=${MODULE_NAMES:-db} node node_modules/@node-c/core/dist/scripts/generateDatasourceFiles.js",
  "migration:generate": "typeorm migration:generate -d datasource-db-${DATASOURCE_ENV:-local}.js src/data/db/migrations/${MIGRATION_NAME}",
  "migration:run": "typeorm migration:run -d datasource-db-${DATASOURCE_ENV:-local}.js"
}
```

NodeC uses ES modules, so relative imports end in `.js`, including in the TypeScript sources.


## 2. Configure the app

Create a constants file for the module names:

```typescript
// src/common/definitions/common.constants.ts
export const Constants = {
  API_TASKS_MODULE_NAME: 'tasks',
  DATA_DB_MODULE_CONNECTION_NAME: 'db_connection',
  DATA_DB_MODULE_NAME: 'db',
  DOMAIN_TASKS_MODULE_NAME: 'tasks'
};
```

Create the common config. It provides non-secret the database and describes the routes anyone may call without logging in:

```typescript
// src/config/config.common.ts
import * as path from 'node:path';

import { type AppConfigCommon, HttpMethod, RDBType } from '@node-c/core';

import { Constants } from '../common/definitions/common.constants.js';

export const appConfigCommon: AppConfigCommon = {
  api: {
    tasks: {
      anonymousAccessRoutes: {
        '/tasks': [HttpMethod.DELETE, HttpMethod.GET, HttpMethod.PATCH, HttpMethod.POST],
        '/tasks/bulk': [HttpMethod.POST],
        '/tasks/item/:id': [HttpMethod.GET]
      }
    }
  },
  data: {
    db: {
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      database: 'first-steps.sqlite',
      type: RDBType.SQLite
    }
  },
  domain: {},
  general: {
    projectName: 'node-c-first-steps',
    projectRootPath: path.resolve(import.meta.dirname, '../../'),
    projectVersion: '1.0.0'
  }
};
```

Create the config for the `local` profile. It contains the host and port for the API server to listen on. It can also contain overrides for values in the common config, if neccesary. It's used whenever `NODE_ENV` isn't set or is set to `local`:

```typescript
// src/config/profiles/config.profile.local.ts
import { type AppConfigProfile, AppEnvironment } from '@node-c/core';

export const appConfigProfileLocal: AppConfigProfile = {
  api: {
    tasks: { allowedOrigins: ['localhost'], hostname: '0.0.0.0', port: 3000 }
  },
  general: { environment: AppEnvironment.Local }
};
```

Create two index files that export the configs for further use by the built-in `ConfigProvider` service:

```typescript
// src/config/profiles/config.profiles.ts
export * from './config.profile.local.js';
```


```typescript
// src/config/config.ts
export * from './config.common.js';
export * from './profiles/config.profiles.js';
```

> [!TIP]
> The keys under `api` and `data` are module names: `config.data.db` configures the data module named `db`, and `config.api.tasks` the API module named `tasks`. See [Configuration](./Fundamentals/configuration.md).


## 3. Set up the data layer

Define a base schema for the columns that every table shares:

```typescript
// src/data/dbBase/entity/base.db.entity.ts
import { EntitySchemaColumnOptions } from 'typeorm';

export interface DBEntity {
  createdAt: Date;
  deletedAt?: Date;
  id: number;
  updatedAt: Date;
}

export const DBEntitySchema: {
  columns: { [columnName: string]: EntitySchemaColumnOptions };
} = {
  columns: {
    createdAt: { type: 'datetime', createDate: true },
    deletedAt: { type: 'datetime', deleteDate: true },
    id: { type: 'integer', primary: true, generated: true },
    updatedAt: { type: 'datetime', updateDate: true }
  }
};
```

Create the `task` entity, its service for working with TypeORM and its module for registering the service:

```typescript
// src/data/db/entities/tasks/tasks.entity.ts
import { EntitySchema } from 'typeorm';

import { type DBEntity, DBEntitySchema } from '../../../dbBase/entity/base.db.entity.js';

export interface DataDBTask extends DBEntity {
  done: boolean;
  title: string;
}

export const DataDBTaskEntity = new EntitySchema<DataDBTask>({
  columns: {
    ...DBEntitySchema.columns,
    done: { type: 'boolean', default: false },
    title: { type: 'varchar' }
  },
  name: 'task',
  tableName: 'tasks'
});
```

```typescript
// src/data/db/entities/tasks/tasks.service.ts
import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';
import { TypeORMDBEntityService, TypeORMDBRepository } from '@node-c/data-typeorm';

import { DataDBTask, DataDBTaskEntity } from './tasks.entity.js';

@Injectable()
export class DataDBTasksService extends TypeORMDBEntityService<DataDBTask> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY) repository: TypeORMDBRepository<DataDBTask>
  ) {
    super(configProvider, logger, qb, repository, DataDBTaskEntity);
  }
}
```

```typescript
// src/data/db/entities/tasks/tasks.module.ts
import { Module } from '@nestjs/common';

import { TypeORMDBRepositoryModule } from '@node-c/data-typeorm';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataDBTaskEntity } from './tasks.entity.js';
import { DataDBTasksService } from './tasks.service.js';

@Module({
  imports: [
    TypeORMDBRepositoryModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      entityClass: DataDBTaskEntity,
      dataModuleName: Constants.DATA_DB_MODULE_NAME
    })
  ],
  providers: [DataDBTasksService],
  exports: [DataDBTasksService]
})
export class DataDBTasksModule {}
```

Create an index file to export all entities, entity services and modules. This is needed so that the framework can automatically pick them up and initialize them:

```typescript
// src/data/db/entities/db.entities.ts
export * from './tasks/tasks.entity.js';
export * from './tasks/tasks.module.js';
export * from './tasks/tasks.service.js';
```

Create the data module class. It connects to the database and registers every entity exported from the index file:

```typescript
// src/data/db/db.module.ts
import { type DynamicModule, Module } from '@nestjs/common';

import { TypeORMDBModule } from '@node-c/data-typeorm';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './entities/db.entities.js';

@Module({})
export class DataDBModule extends TypeORMDBModule {
  static register(): DynamicModule {
    return TypeORMDBModule.register({
      connectionName: Constants.DATA_DB_MODULE_CONNECTION_NAME,
      folderData: FolderData,
      moduleClass: DataDBModule,
      moduleName: Constants.DATA_DB_MODULE_NAME
    });
  }
}
```

> [!WARNING]
> Modules pick up the exports of their index file **by name suffix** - `...Entity`, `...Module`, `...Service`, `...Controller`. A class with another ending, or one that isn't exported from the index file, is silently ignored.


## 4. Set up the domain layer

This is where your business logic goes. For now, we only need a basic domain layer entity service with its default methods - `find`, `findOne`, `create`, `bulkCreate`, `update` and `delete`:

```typescript
// src/domain/tasks/services/tasks/tasks.service.ts
import { Injectable } from '@nestjs/common';

import { DomainEntityService, LoggerService } from '@node-c/core';

import { DataDBTask } from '../../../../data/db/entities/tasks/tasks.entity.js';
import { DataDBTasksService } from '../../../../data/db/entities/tasks/tasks.service.js';

@Injectable()
export class DomainTasksService extends DomainEntityService<DataDBTask, DataDBTasksService> {
  constructor(dataEntityService: DataDBTasksService, logger: LoggerService) {
    super(dataEntityService, undefined, logger);
  }
}
```

Create the index file, similar to the data layer's index file:

```typescript
// src/domain/tasks/services/tasks.services.ts
export * from './tasks/tasks.service.js';
```

Create the module, while will register the domain services:

```typescript
// src/domain/tasks/tasks.module.ts
import { Global, Module } from '@nestjs/common';

import { loadDynamicModules, Constants as NodeCCoreConstants } from '@node-c/core';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './services/tasks.services.js';

const { services } = loadDynamicModules(FolderData);

@Global()
@Module({
  providers: [
    { provide: NodeCCoreConstants.DOMAIN_MODULE_NAME, useValue: Constants.DOMAIN_TASKS_MODULE_NAME },
    ...services!
  ],
  exports: [...services!]
})
export class DomainTasksModule {}
```


## 5. Set up the API layer

Create a controller for the `tasks` entity:

```typescript
// src/api/tasks/controllers/tasks/tasks.controller.ts
import { Controller, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RESTAPIEntityController } from '@node-c/api-rest';
import { LoggerService } from '@node-c/core';

import { DataDBTask } from '../../../../data/db/entities/tasks/tasks.entity.js';
import { DomainTasksService } from '../../../../domain/tasks/services/tasks/tasks.service.js';

@Injectable()
@Controller('tasks')
export class APITasksEntityController extends RESTAPIEntityController<DataDBTask, DomainTasksService> {
  constructor(domainEntityService: DomainTasksService, logger: LoggerService, reflector: Reflector) {
    super(domainEntityService, RESTAPIEntityController.getDefaultDtos<DataDBTask>(), logger, reflector);
  }
}
```

Similar to the data and domain modules, export the controller(s) using an index file:

```typescript
// src/api/tasks/controllers/tasks.controllers.ts
export * from './tasks/tasks.controller.js';
```

Create the module itself. It registers the controllers:

```typescript
// src/api/tasks/tasks.module.ts
import { Module } from '@nestjs/common';

import { HTTPAPIModule, type HTTPAPIModuleOptions } from '@node-c/api-http';

import { Constants } from '../../common/definitions/common.constants.js';

import * as FolderData from './controllers/tasks.controllers.js';

@Module({})
export class APITasksModule extends HTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData,
    moduleClass: APITasksModule,
    moduleName: Constants.API_TASKS_MODULE_NAME
  };
}
```

This API has no logins, so it doesn't need an IAM setup. Its routes are public because they're listed in `anonymousAccessRoutes`. Adding logins and permissions later is covered in [Authentication](./Security/authentication.md).


## 6. Put it together

The app module imports all layer modules, plus the config and logger modules:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';

import { ConfigProviderModule, type ConfigProviderModuleOptions, LoggerModule } from '@node-c/core';

import { APITasksModule } from './api/tasks/tasks.module.js';
import * as AppConfigs from './config/config.js';
import { DataDBModule } from './data/db/db.module.js';
import { DomainTasksModule } from './domain/tasks/tasks.module.js';

// the generateDatasourceFiles script reads the config options from AppModuleBase in dist/app.module.js
export class AppModuleBase {
  static readonly configProviderModuleRegisterOptions: ConfigProviderModuleOptions = {
    appConfigs: AppConfigs as unknown as ConfigProviderModuleOptions['appConfigs']
  };
}

@Module({
  imports: [
    ConfigProviderModule.register(AppModuleBase.configProviderModuleRegisterOptions),
    LoggerModule.register(),
    DataDBModule.register(),
    DomainTasksModule,
    APITasksModule.register(APITasksModule.moduleOptions)
  ]
})
export class AppModule extends AppModuleBase {}
```

This is your main file, which is used to bootstrap the app:

```typescript
// src/main.ts
import process from 'node:process';

import { DynamicModule } from '@nestjs/common';

import { NodeCApp } from '@node-c/core';

import { AppModule, AppModuleBase } from './app.module.js';
import { Constants } from './common/definitions/common.constants.js';

(async () => {
  await NodeCApp.start([AppModule as unknown as DynamicModule], {
    apiModulesOptions: [{ appModuleIndex: 0, apiModuleName: Constants.API_TASKS_MODULE_NAME }],
    generateOrmConfig: true,
    loadConfigOptions: AppModuleBase.configProviderModuleRegisterOptions
  });
})().then(
  () => console.info('App started.'),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
```


## 7. Initialize the database

The final step is initializing the database by generating an initial migration based on the entity definitions.

This is done by build the app, generating a TypeORM datasource file, then generating and running the initial migration:

```bash
# build the app
npm run build
# generate a TypeORM datasource file
npm run generate:datasource-files
# generate the initial migration
MIGRATION_NAME=CreateTasks npm run migration:generate
# rebuild the app to get the migration file into the dist folder
npm run build
# execute the migration
npm run migration:run
```

`migration:generate` compares your entities with the (still empty) database and writes `src/data/db/migrations/<timestamp>-CreateTasks.ts`, with a `CREATE TABLE "tasks"` statement. The second build compiles it, because migrations run from `dist`. See [Defining entities](./Data/entities.md#datasource-files-and-migrations).


## 8. Run the app

```bash
npm start
```

The log ends with `Nest application successfully started`, and the API is at `http://localhost:3000`. In a second terminal, you can call the API to get the pre-seeded tasks:

```bash
curl -X POST localhost:3000/tasks -H 'content-type: application/json' -d '{"data":{"title":"Read the NodeC docs"}}'
```

```json
{"result":{"title":"Read the NodeC docs","createdAt":"2026-11-10T19:07:22.000Z","deletedAt":null,"id":1,"updatedAt":"2026-11-10T19:07:22.000Z","done":false}}
```

Now, try creating two more tasks at once:

```bash
curl -X POST localhost:3000/tasks/bulk -H 'content-type: application/json' -d '{"data":[{"title":"Build an app"},{"title":"Ship it","done":true}]}'
```

Find the tasks that aren't done, get one by id, and mark the first one as done:

```bash
curl -g 'localhost:3000/tasks?filters[done]=0'
curl localhost:3000/tasks/item/1
curl -X PATCH localhost:3000/tasks -H 'content-type: application/json' -d '{"data":{"done":true},"filters":{"id":1},"returnData":true}'
```

The first request returns the two open tasks:

```json
{"result":{"page":1,"perPage":10,"items":[{"createdAt":"2026-11-10T19:07:22.000Z","deletedAt":null,"id":1,"updatedAt":"2026-11-10T19:07:22.000Z","done":false,"title":"Read the NodeC docs"},{"createdAt":"2026-11-10T19:07:22.000Z","deletedAt":null,"id":2,"updatedAt":"2026-11-10T19:07:22.000Z","done":false,"title":"Build an app"}],"more":false,"totalCount":2}}
```

And the update returns the updated row, because of `returnData: true`:

```json
{"result":{"count":1,"items":[{"createdAt":"2026-11-10T19:07:22.000Z","deletedAt":null,"id":1,"updatedAt":"2026-11-10T19:07:22.000Z","done":true,"title":"Read the NodeC docs"}]}}
```

Then try searching, with sorting and picking of specific fields:

```bash
curl -g 'localhost:3000/tasks?filters[title][$like]=%25app%25&orderBy[id]=desc&select[]=id&select[]=title'
```

Delete a task - it's a soft delete, so it disappears from the results but stays in the table with a timestamp set for `deletedAt`:

```bash
curl -X DELETE localhost:3000/tasks -H 'content-type: application/json' -d '{"filters":{"id":3}}'
curl -g 'localhost:3000/tasks?findAll=true'
```

You can also send something invalid to see the validation in action:

```bash
curl -X POST localhost:3000/tasks -H 'content-type: application/json' -d '{}'
```

```json
{"error":"data should not be null or undefined\ndata must be an object\ndata must be a non-empty object","statusCode":400}
```

> [!TIP]
> Pass `-g` to curl for URLs with `[...]` in them - otherwise curl treats the brackets as a glob pattern and doesn't send the request.

> [!WARNING]
> Query string values are strings, and SQLite doesn't match the string `false` against a boolean column - use `0` and `1` for booleans in filters.


## What just happened

- The **data service** turned the request's `filters`, `orderBy`, `select` and pagination into SQL - see [Query filters](./Data/query-filters.md).
- The **domain service** passed each call to its data service. This is where you'll add business rules - see [Domain services](./Overview/domain-services.md).
- The **controller** validated every request against its DTO, and mapped errors to `{ error, statusCode }` - see [Controllers](./Overview/controllers.md).
- Around all of it, the **API module** ran the request pipeline - see [Request lifecycle](./Overview/request-lifecycle.md).


## Running the premade finished app

From a clone of the repository:

```bash
npm install
npm run build:clean:all
cd apps/first-steps
npm run generate:datasource-files
npm run migration:run
npm start
```


## Next steps

- Add business logic to the domain service: [Domain services](./Overview/domain-services.md)
- Put a Redis cache in front of the table: [Caching with Redis](./Recipes/caching.md)
- Add logins and permissions: [Authentication](./Security/authentication.md) and [Access Control](./Security/access-control.md)
- Switch to MySQL or PostgreSQL: [Relational databases](./Data/rdb.md#supported-databases)
- See a full app with all of it: the reference app in `apps/test`, and its [end-to-end tests](./Testing/e2e.md)

---

Previous: [Introduction](./index.md) · Next: [Layers and modules](./Overview/layers.md)
