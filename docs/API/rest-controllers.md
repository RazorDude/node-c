# REST Controllers

`RESTAPIEntityController` (from `@node-c/api-rest`) exposes a domain entity service as a set of REST routes. A controller extends it, passes the domain service and the DTOs, and gets authorization, access control, validation and error mapping for free.

&nbsp;

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
- A disabled route returns `404 { message: 'Not found', statusCode: 404 }`.
- The handler name is also the access control **resource** name (see <a href='../Architecture/access-control.md' target='_blank'>Access Control</a>), so a permission for `find` doesn't cover `findOne`.

&nbsp;

## Request format

| Route | Where | Fields |
|---|---|---|
| `GET /` | query string | `filters`, `include`, `select`, `orderBy`, `page`, `perPage`, `findAll`, `individualSearch` |
| `GET /item/:id` | `params.id` + query string | `filters`, `include`, `select`, `orderBy` |
| `POST /` | body | `data` (required, non-empty object) |
| `POST /bulk` | body | `data` (required, non-empty array) |
| `PATCH /` | body | `data` and `filters` (both required), `returnData`, `returnOriginalItems` |
| `DELETE /` | body | `filters` (required), `returnOriginalItems` |

- All routes also accept `dataServices` and `optionsOverridesByService` (see <a href='../Architecture/overview.md' target='_blank'>Architecture overview</a>). Each service's overrides are validated separately, against the route's overrides DTO.
- `RESTAPIEntityController.getDefaultDtos<Entity>()` returns the default DTOs for all six routes. For `saveAdditionalResultsInFirstService` on find/findOne, pass `FindWithSaveAddtionalOptionsDto`/`FindOneWithSaveAddtionalOptionsDto` instead.
- The query string is parsed with `qs`, so nested filters use bracket syntax: `filters[courseTypeId]=1`, `filters[id][]=1&filters[id][]=2`, `filters[createdAt][$gte]=2025-01-01`. `qs` only parses **5 levels deep**.
- For findOne, the handler sets `filters.id` from the route param. This happens **after** access control, so a permission must check `params.id`, not `query.filters.id`.
- DTOs are validated with `whitelist`, so unknown properties are stripped. `withDeleted` isn't accepted.

See <a href='../Data/query-filters.md' target='_blank'>Query filters</a> for the filter syntax.

&nbsp;

## Custom DTOs

Extend the `@node-c/api-rest` DTOs (`BaseFindDto`, `FindDto`, `UpdateDto`, ...) and pass them in the controller's `dto` object. Helpers:
- `dtoTransformBoolean` / `dtoTransformNumber` - use with `@Transform(...)` so that `'true'` or `'10'` from a query string become real values.
- `dtoTransformRecordToMap` - turns a record into a `Map`.
- `@RewriteValidationOptions({ whitelist: false, ... })` on a DTO class - changes the validation options for that class only. The controller validates with an `UpdatableValidationPipe` that reads it.

The controller is built on the <a href='./http-module.md' target='_blank'>HTTP API module</a> - see that page for the middlewares, interceptors and error handling around it.

&nbsp;

## Custom routes

Add a method with the usual NestJS decorators to the controller:

```typescript
@Post('publish/:id')
async publish(@Param('id') id: string, @Body() body: PublishCourseDto): Promise<DomainUpdateResult<DataDBCourse>> {
  return await this.domainEntityService.publish(id, body);
}
```

- It goes through the same middlewares and interceptors as the default routes. Its access control resource is the method name (`publish`), unless you set `@AccessControlResource('...')`, so it needs its own permission.
- Type `@Body()`/`@Query()` with DTO classes - the global `ValidationPipe({ whitelist: true })` validates them and strips unknown properties. Parameters typed with an interface or not typed at all aren't validated.
- Throw `ApplicationError` (400, or `data.statusCode`), or an `HttpException` with an object response (`{ message, statusCode }`) - a string response becomes a 500.
- A route that must work without a login goes in the module config's `anonymousAccessRoutes`.
- Keep the logic in a domain service method (see <a href='../Architecture/domain-services.md' target='_blank'>Domain services</a>) - the handler should only map the request to it.

&nbsp;

## Responses and errors

Successful responses return the domain result, e.g. `{ result: { items, page, perPage, more }, resultsByService? }` for find.

Errors are mapped by `HTTPErrorInterceptor` to `{ error, statusCode }`:
- `ApplicationError` / `ServerError` → the error's `data.errorCode`, else `data.statusCode`, else 400, with the error's message
- an error with a `response` (e.g. `HttpException`) → the response's `statusCode` and `message`. If the response is a string, neither exists, so you get a 500 with `An error has occurred.`
- any other `Error` → 500 with the error's message

Exceptions thrown outside the error interceptor - e.g. the access control 403, or Nest's 404 for an unknown route - are formatted by the global `HttpExceptionFilter` the same way: `{ error: <message>, statusCode }`. So a denied request gets `{ error: 'Forbidden', statusCode: 403 }`. 401s come from the authorization middleware and have an empty body (see <a href='./http-module.md' target='_blank'>HTTP API module</a>).
