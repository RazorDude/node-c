# Controllers

Controllers are the entry point of your apllication: they turn HTTP requests into domain service calls. In NodeC, you rarely write route handlers yourself - you extend `RESTAPIEntityController` (from `@node-c/api-rest`), inject a domain service, and get six CRUD routes with filtering, pagination, validation, access control and error handling.

```typescript
@Injectable()
@Controller('tasks')
export class APITasksEntityController extends RESTAPIEntityController<DataDBTask, DomainTasksService> {
  constructor(domainEntityService: DomainTasksService, logger: LoggerService, reflector: Reflector) {
    super(domainEntityService, RESTAPIEntityController.getDefaultDtos<DataDBTask>(), logger, reflector);
  }
}
```

After you add the controller file to the exports in the API module's controllers index file, the module will automatically process them at runtime and create the routes defined in the class:

```bash
# create
curl -X POST localhost:3000/tasks -H 'content-type: application/json' -d '{"data":{"title":"Write docs"}}'
# bulk create
curl -X POST localhost:3000/tasks -H 'content-type: application/json' -d '{"data":[{"title":"Write more docs"}, "title": "Check what you wrote"]}'
# find
curl -g 'localhost:3000/tasks?filters[title][$like]=%25docs%25&orderBy[id]=desc&page=1&perPage=20'
# findOne
curl localhost:3000/tasks/item/1
# update
curl -X PATCH localhost:3000/tasks -H 'content-type: application/json' -d '{"data":{"done":true},"filters":{"id":1}}'
# delete
curl -X DELETE localhost:3000/tasks -H 'content-type: application/json' -d '{"filters":{"id":1}}'
```

By default, a controller class that inherits NodeC's `RESTAPIEntityController` has the following constructor arguments:
- The domain service for the entity.
- The DTOs. We have a DTO for each default route, and default routes without a DTO are disabled. I.e. if you pass `['find', 'findOne']` instead of `RESTAPIEntityController.getDefaultDtos<DataDBTask>()`, the rest of default routes will not be mounted.
- The logger service.
- NestJS's `Reflector`, used under the hood in the permissions system.
- Optionally, the list of default routes to enable (more on this below).

## Routes

| Method | Path | Handler | Domain method |
|---|---|---|---|
| `POST` | `/bulk` | `bulkCreate` | `bulkCreate` |
| `POST` | `/` | `create` | `create` |
| `DELETE` | `/` | `delete` | `delete` |
| `GET` | `/` | `find` | `find` |
| `GET` | `/item/:id` | `findOne` | `findOne` |
| `PATCH` | `/` | `update` | `update` |

- A route is enabled if the controller passes a DTO for it.
- If the controller passes a non-empty `defaultRouteMethods` list, exactly the routes in that list are enabled - **even those without a DTO**, whose input then isn't validated or whitelisted (e.g. the SSO users controller passes `{}` and `['find', 'findOne']`).
- A disabled route returns `404 { error: 'Not found', statusCode: 404 }`.
- The class function name (a.k.a. route handler) is also the access control **resource** name (see [Access Control](../Security/access-control.md)), so a permission for `find` doesn't cover `findOne`.

## Request format

| Route | Where | Fields |
|---|---|---|
| `GET /` | query string | `filters`, `include`, `select`, `orderBy`, `page`, `perPage`, `findAll`, `individualSearch` |
| `GET /item/:id` | `params.id` + query string | `filters`, `include`, `select`, `orderBy` |
| `POST /` | body | `data` (required, non-empty object) |
| `POST /bulk` | body | `data` (required, non-empty array) |
| `PATCH /` | body | `data` and `filters` (both required), `returnData`, `returnOriginalItems` |
| `DELETE /` | body | `filters` (required), `returnOriginalItems` |

- All routes also accept `dataServices` and `optionsOverridesByService` (see [Multiple data services](../Fundamentals/multiple-data-services.md)). Each service's overrides are validated separately, against the route's overrides DTO.
- The query string is parsed with `qs`, so nested filters use bracket syntax: `filters[courseTypeId]=1`, `filters[id][]=1&filters[id][]=2`, `filters[createdAt][$gte]=2025-01-01`. `qs` only parses **5 levels deep**.
- For findOne, the handler sets `filters.id` from the route param. This happens **after** access control, so a permission must check `params.id`, not `query.filters.id`.
- DTOs are validated with `whitelist`, so unknown properties are stripped. `withDeleted` isn't accepted.

See [Query filters](../Data/query-filters.md) for the filter syntax.

> [!WARNING]
> Filter values in the query string are **strings**. Databases compare them differently - for example, SQLite doesn't match `filters[done]=false` against a boolean column, while `filters[done]=0` works. For exact typed filters, send them from code or use a custom DTO.

> [!TIP]
> When trying bracketed query strings with curl, pass `-g` (or quote and URL-encode the brackets) - otherwise curl treats `[...]` as a glob pattern and doesn't send the request.

## Custom DTOs

Extend the `@node-c/api-rest` DTOs (`BaseFindDto`, `FindDto`, `UpdateDto`, ...) and pass them in the controller's `dto` object. Helpers:
- `dtoTransformBoolean` / `dtoTransformNumber` - use with `@Transform(...)` so that `'true'` or `'10'` from a query string become real values.
- `dtoTransformRecordToMap` - turns a record into a `Map`.
- `@RewriteValidationOptions({ whitelist: false, ... })` on a DTO class - changes the validation options for that class only. The controller validates with an `UpdatableValidationPipe` that reads it.

The controller is built on the [HTTP API module](../Fundamentals/http-module.md) - see that page for the middlewares, interceptors and error handling around it.

## Custom routes

Adding a method is simple - just use the usual NestJS decorators on a function in the controller:

```typescript
@Post('publish/:id')
async publish(@Param('id') id: string, @Body() body: PublishCourseDto): Promise<DomainUpdateResult<DataDBCourse>> {
  return await this.domainEntityService.publish(id, body);
}
```

- It goes through the same middlewares and interceptors as the default routes. Its access control resource is the method name (`publish`), unless you set `@AccessControlResource('...')`.
- Type `@Body()`/`@Query()` with DTO classes - the global `ValidationPipe({ whitelist: true })` validates them and strips unknown properties. Parameters typed with an interface or not typed at all aren't validated.
- A route that must work without a login goes in the module config's `anonymousAccessRoutes`.
- Keep the logic in a domain service method (see [Domain services](../Overview/domain-services.md)) - the handler should only map the request to it.

## Responses and errors

Successful responses return the domain result, e.g. `{ result: { items, page, perPage, more }, resultsByService? }` for find.

Errors are mapped by `HTTPErrorInterceptor` to `{ error, statusCode }`:
- `ApplicationError` / `ServerError` → the error's `data.errorCode`, else `data.statusCode`, else 400, with the error's message
- an error with a `response` (e.g. `HttpException`) → the response's `statusCode` and `message`. If the response is a string, neither exists, so you get a 500 with `An error has occurred.`
- any other `Error` → 500 with the error's message

Exceptions thrown outside the error interceptor - e.g. the access control 403, or Nest's 404 for an unknown route - are formatted by the global `HttpExceptionFilter` the same way: `{ error: <message>, statusCode }`. This means that a denied request gets `{ error: 'Forbidden', statusCode: 403 }`. 401s come from the authorization middleware and have an empty body (see [HTTP API module](../Fundamentals/http-module.md)).

> [!WARNING]
> When throwing errors anywhere in the stack, use either `ApplicationError` (400, or `data.statusCode`), or an `HttpException`, either of which - with an object response (`{ message, statusCode }`). Otherwise, an Error constructor with a string message simply becomes a Internal Server Error (statusCode 500).

---

Previous: [Layers and modules](./layers.md) · Next: [Domain services](./domain-services.md)
