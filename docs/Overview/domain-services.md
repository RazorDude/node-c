# Domain Services

A domain entity service (`DomainEntityService` from `@node-c/core`) is where an entity's business logic lives. It wraps a main data service for the entity and, optionally, additional data services for the same entity. It is what controllers and other domain services call. Out of the box, it already has `find`, `findOne`, `create`, `bulkCreate`, `update` and `delete` - you add or override only what's specific to your domain.

Lets examine the smallest possible domain entity service, the one from [First steps](../first-steps.md):

```typescript
@Injectable()
export class DomainTasksService extends DomainEntityService<DataDBTask, DataDBTasksService> {
  constructor(dataEntityService: DataDBTasksService, logger: LoggerService) {
    super(dataEntityService, undefined, logger);
  }
}
```

## Anatomy

A domain service with a SQLLite data service as the main one, and a Redis cache as an additional data service:

```typescript
@Injectable()
export class DomainCoursePlatformDelegatedCoursesService extends DomainEntityService<
  DataDBCourse,                                   // Entity
  DataDBCoursesService,                           // main data service type
  DomainEntityServiceDefaultData<DataDBCourse>,   // input data types per method
  { cache: DataCacheCoursesEntityService }        // additional data services
> {
  constructor(
    protected cache: DataCacheCoursesEntityService,
    dataEntityService: DataDBCoursesService,
    logger: LoggerService
  ) {
    super(dataEntityService, undefined, logger, { cache });
  }
}
```

Constructor arguments:
1. `dataEntityService` - the main data service (`'main'` in `dataServices`)
2. `defaultMethods` - the enabled methods; `undefined` means `DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS` (`bulkCreate`, `create`, `delete`, `find`, `findOne`, `update`). A method that's not in the list throws `Method <name> not implemented for class ...`.
3. `logger` - the app's logger service, from `@node-c/core`.
4. `additionalDataEntityServices` - the other data services, by name. The names are what `dataServices` and `optionsOverridesByService` use.

The service is registered in and exported by the domain module class. For that to work, its file must be added as an export to the services index file for the module, and the class name must end with `Service`.

## Methods and options

Every method takes an options arg and an optional **private options** argument. For creates and updates, there is also a data argument in the start:

```typescript
find(options: DomainFindOptions, privateOptions?: DomainFindPrivateOptions): Promise<DomainFindResult<Entity>>
findOne(options: DomainFindOneOptions, privateOptions?: DomainFindOnePrivateOptions): Promise<DomainFindOneResult<Entity>>
create(data: Partial<Entity>, options?: DomainCreateOptions, privateOptions?: DomainCreatePrivateOptions): Promise<DomainCreateResult<Entity>>
bulkCreate(data[]: Partial<Entity>[], options?: DomainBulkCreateOptions, privateOptions?: DomainBulkCreatePrivateOptions): Promise<DomainBulkCreateResult<Entity>>
update(data: Partial<Entity>, options: DomainUpdateOptions, privateOptions?: DomainUpdatePrivateOptions): Promise<DomainUpdateResult<Entity>>
delete(options: DomainDeleteOptions, privateOptions?: DomainDeletePrivateOptions): Promise<DomainDeleteResult<Entity>>
```

- **Public options** can come from an API request: `filters`, `include`, `select`, `orderBy`, `page`, ... plus the multi-service options `dataServices`, `optionsOverridesByService` and `saveAdditionalResultsInFirstService` (see [Multiple data services](../Fundamentals/multiple-data-services.md)).
- **Private options** are for code only and are passed straight to the data services, e.g. `withDeleted`, `requirePrimaryKeys`, `processFiltersAllowedFieldsEnabled`, or service-specific ones like the reference app's `withPassword` for users.
- Results are `{ result, resultsByService? }`.

How the additional services are called:
- `find`, `findOne` - with the same options as the first service, plus that service's overrides. By default (`runOnNoFirstServiceResultOnly: true`), only when the first service found nothing.
- `create`, `bulkCreate` - with the **first service's result** as the data, e.g. the cache gets the row the database created, with its generated id. Because a successful create counts as a result, the additional services are **skipped by default** - pass `optionsOverridesByService: { cache: { runOnNoFirstServiceResultOnly: false } }` to write to them too.
- `update`, `delete` - with the same data and options. By default, only when the first service **did** update or delete something (`count > 0`).

> [!WARNING]
> `defaultMethods` is the **second** constructor argument. Pass `undefined` for the defaults - passing the logger there by mistake makes every method call fail.

## Overriding a method

Override a method to add logic before or after the default behaviour, and call `super`:

```typescript
async create(data: DataDBCourse, options?: DomainCreateOptions): Promise<DomainCreateResult<DataDBCourse>> {
  if (!data.name?.trim()) {
    throw new ApplicationError('A course name is required.', { statusCode: HttpStatus.BAD_REQUEST });
  }
  return await super.create(data, {
    ...options,
    dataServices: ['main', 'cache'],
    optionsOverridesByService: { cache: { runOnNoFirstServiceResultOnly: false } }
  });
}
```

To turn off a default method entirely, leave it out of `defaultMethods`, and the REST route out of the controller's DTOs or `defaultRouteMethods`.

## Adding a custom method

Add a normal method and call the data services directly, or the default methods. `IAMUsersService.getUserWithPermissionsData` in the reference app is an example: it calls `this.findOne` with the relations the permissions need and a cache-first `dataServices` setup, then flattens the permissions into `currentPermissions`.

To expose a custom method over HTTP, add a custom route to the controller (see [Controllers](./controllers.md#custom-routes)) and give it permissions - its access control resource is the method's name.

> [!TIP]
> Keep business rules here, not in controllers or data services. Controllers should only map the request to a domain call, and data services should only talk to their storage.

## Transactions

Transactions belong to the data layer: RDB services take a `transactionManager` (or `forceTransaction: true`) and Redis services a `transactionId`, both in the public options. Domain services don't have access to the repositories, so logic that needs several writes in one transaction belongs in a data service method, which opens the transaction and passes it down (see [Relational databases](../Data/rdb.md#transactions)). A transaction never spans several data services.

---

Previous: [Controllers](./controllers.md) · Next: [Request lifecycle](./request-lifecycle.md)
