# AI Guide - API

Checklists for adding or changing controllers. See the <a href='../ai-guide.md' target='_blank'>main AI guide</a> for the repo map and conventions, and <a href='./rest-controllers.md' target='_blank'>REST controllers</a> and <a href='./http-module.md' target='_blank'>HTTP API module</a> for the details.

&nbsp;

## Key files

| Concern | File |
|---|---|
| Module setup, middleware order, global pipe and filter | `packages/api-http/src/module/http.api.module.ts` |
| Middlewares | `packages/api-http/src/middlewares/` |
| REST controller, default routes, route enabling | `packages/api-rest/src/entityController/rest.entity.controller.ts` |
| Default DTOs | `packages/api-rest/src/entityController/dto/` |
| API module example (reference app) | `apps/test/src/api/coursePlatformDelegated/coursePlatformDelegated.module.ts` |

&nbsp;

## Adding a controller

1. Extend `RESTAPIEntityController<Entity, DomainService>` and call `super(domainService, dtos, logger, reflector, defaultRouteMethods?)`.
2. Use `RESTAPIEntityController.getDefaultDtos<Entity>()`, or your own DTOs extending the `@node-c/api-rest` ones.
3. Restrict the routes with `defaultRouteMethods` - but remember that a route in that list is enabled even without a DTO, and then isn't validated.
4. Set `@AccessControlContext('...')` - it's the `resourceContext` permissions must use. Otherwise it's the class name.
5. Export the controller from the API module's controllers index file.
6. Add permissions for every enabled handler (`find`, `findOne`, ...) - non-admin users get a 403 without them.

&nbsp;

## Adding a custom route

- Custom handlers go through the same middleware and interceptors. The handler method name is the access control resource, unless you set `@AccessControlResource('...')`.
- Type the `@Body()`/`@Query()` parameters with DTO classes. The HTTP API module registers a global `ValidationPipe({ whitelist: true })`, which validates them and strips unknown properties. Untyped or interface-typed parameters aren't validated.
- Throw `ApplicationError` (400, or `data.statusCode`), or `HttpException` with an **object** response (`{ message, statusCode }`). A string response becomes a 500.
- A public route (no login) must be in the module config's `anonymousAccessRoutes`.

&nbsp;

## Adding an API module

1. Extend `HTTPAPIModule` with static `moduleOptions` (`folderData`, `moduleClass`, `moduleName`, `providers`).
2. Provide `ACCESS_CONTROL_MODULE_NAME` and the authorization, authentication manager and token manager services.
3. Add `config.api.<moduleName>` (`hostname`, `port`, `allowedOrigins`, `anonymousAccessRoutes`, ...).
4. Import `APIXModule.register(APIXModule.moduleOptions)` in its own app module and add it to `NodeCApp.start`'s `apiModulesOptions`.

&nbsp;

## Checking a change

- Test with the e2e suite. Calls with a non-admin user show permission problems that admin calls hide.
- For query string requests, remember that `qs` parses only 5 levels deep.
- Unknown routes return the middleware's empty 401 when there's no valid token - don't read it as an auth bug.
- Renewed tokens come back in the response's `Authorization` header.
