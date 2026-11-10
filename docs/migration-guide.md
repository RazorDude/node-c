# Migration Guide: 1.0.0-beta8 → 1.0.0-beta9

beta9 moves NodeC to ES modules and TypeScript 7, and changes a few APIs. This page lists everything you need to change in an app, in the order you're likely to hit it. The full list of changes is in the [changelog](https://github.com/RazorDude/node-c/blob/master/changelog.md).

## 1. ES modules

All packages are now ES modules.

- Add `"type": "module"` to your app's `package.json`, and use Node.js 22 or later.
- Use `"module": "nodenext"` and `"moduleResolution": "nodenext"` in `tsconfig.json`.
- Add the `.js` extension to every relative import - also in TypeScript sources:

```typescript
// beta8
import { DataDBCourse } from './courses.entity';
// beta9
import { DataDBCourse } from './courses.entity.js';
```

- Replace `__dirname` with `import.meta.dirname`, e.g. in `general.projectRootPath`.

## 2. TypeScript 7

Upgrade TypeScript to 7. NodeC's packages are compiled with it, and their declaration files need it.

## 3. Index files instead of barrel files

Folders whose contents are loaded with `import * as FolderData` (entities, services, controllers) no longer have an `index.ts`. Rename each one to a named index file and import it explicitly:

```typescript
// beta8 - src/data/db/entities/index.ts
import * as FolderData from './entities';
// beta9 - src/data/db/entities/db.entities.ts
import * as FolderData from './entities/db.entities.js';
```

The convention is `<folder>.entities.ts`, `<module>.services.ts` and `<module>.controllers.ts`. Barrel files elsewhere in your app can go - import from the files directly.

## 4. Controllers

**`RESTAPIEntityController` needs `Reflector`.** Inject it and pass it after the logger:

```typescript
// beta8
constructor(domainEntityService: DomainCoursesService, logger: LoggerService) {
  super(domainEntityService, dtos, logger);
}
// beta9
constructor(domainEntityService: DomainCoursesService, logger: LoggerService, reflector: Reflector) {
  super(domainEntityService, dtos, logger, reflector);
}
```

**Typo fixes in class names.** `RESTAPIEntityControler` is now `RESTAPIEntityController`, and `RESTAPIEntityControlerWithoutDto` is `RESTAPIEntityControllerWithoutDto`.

**`defaultRouteMethods` limits the routes.** In beta8, the enabled routes were the routes with a DTO *plus* the ones in `defaultRouteMethods`. In beta9, a non-empty `defaultRouteMethods` list enables exactly those routes - a route with a DTO that isn't in the list is now disabled. See [Controllers](./Overview/controllers.md#routes).

**`BaseDto` is no longer generic.** Replace `BaseDto<Options>` with `BaseDto` in your DTOs.

**Boolean and number query values.** The default DTOs now transform `'true'`/`'false'` and numeric strings for their own options (`findAll`, `page`, `returnData`, ...), so those work from the query string. This doesn't change `filters` values.

## 5. Data services

**`withDeleted` and `getTotalCount` are private options.** They moved from the find, findOne and count options to the private options (the second argument of the data service methods), so they can no longer be set through the API:

```typescript
// beta8
await dataService.find({ filters, withDeleted: true });
// beta9
await dataService.find({ filters }, { withDeleted: true });
```

**Override filters are combined, not replaced.** In `optionsOverridesByService`, a service's `filters` are now combined with the original filters using `$and`, instead of replacing them. If you relied on replacing them, express the full filter in the override's terms. See [Multiple data services](./Fundamentals/multiple-data-services.md).

## 6. Logging

**`LoggerModule.register({ pinoParams })` replaces the defaults instead of merging with them.** To keep the defaults and change one setting, spread them yourself:

```typescript
LoggerModule.register({
  pinoParams: { ...DEFAULT_PINO_PARAMS, pinoHttp: { ...DEFAULT_PINO_PARAMS.pinoHttp, level: 'debug' } }
});
```

**`nestjs-pino` is vendored.** Import types such as `Params` from `@node-c/nestjs-pino` instead of `nestjs-pino`. See [Logging](./Fundamentals/logging.md).

## 7. New, and worth knowing

Not breaking, but new in beta9:
- SQLite support (`type: 'sqlite'`) - see [Relational databases](./Data/rdb.md#supported-databases)
- API modules with only public routes need no IAM providers - see [HTTP API module](./Fundamentals/http-module.md#defining-an-api-module)
- Filters on relations now work in `update` and `delete`, and `select`/`orderBy` support nested relations
- `saveAdditionalResultsInFirstService` works when the first service isn't the main one
- ClickHouse queries send their values as typed parameters
- The REST DTOs validate `optionsOverridesByService` per service

---

Previous: [Glossary](./glossary.md) · Next: [Contributing](./contributing.md)
