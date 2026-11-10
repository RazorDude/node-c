# AI Guide - Overview

Checklists for adding or changing controllers, domain services and API modules. See the [main AI guide](../ai-guide.md) for the repo map and conventions, and [Controllers](./controllers.md), [Domain services](./domain-services.md) and [HTTP API module](../Fundamentals/http-module.md) for the details.

## Key files

| Concern | File |
|---|---|
| Module setup, middleware order, global pipe and filter | `packages/api-http/src/module/http.api.module.ts` |
| Middlewares | `packages/api-http/src/middlewares/` |
| REST controller, default routes, route enabling | `packages/api-rest/src/entityController/rest.entity.controller.ts` |
| Default DTOs | `packages/api-rest/src/entityController/dto/` |
| Domain entity service base class | `packages/core/src/domain/entityService/domain.entity.service.ts` |
| Smallest complete example (all three layers) | `apps/first-steps/src/` |
| API module with IAM (reference app) | `apps/test/src/api/coursePlatformDelegated/coursePlatformDelegated.module.ts` |

## Adding a controller

1. Extend `RESTAPIEntityController<Entity, DomainService>` and call `super(domainService, dtos, logger, reflector, defaultRouteMethods?)`.
2. Use `RESTAPIEntityController.getDefaultDtos<Entity>()`, or your own DTOs extending the `@node-c/api-rest` ones.
3. Restrict the routes with `defaultRouteMethods` - but remember that a route in that list is enabled even without a DTO, and then isn't validated.
4. Set `@AccessControlContext('...')` - it's the `resourceContext` permissions must use. Otherwise it's the class name.
5. Export the controller from the API module's controllers index file.
6. Add permissions for every enabled handler (`find`, `findOne`, ...) - non-admin users get a 403 without them.

## Adding a custom route

- Custom handlers go through the same middleware and interceptors. The handler method name is the access control resource, unless you set `@AccessControlResource('...')`.
- Type the `@Body()`/`@Query()` parameters with DTO classes. The HTTP API module registers a global `ValidationPipe({ whitelist: true })`, which validates them and strips unknown properties. Untyped or interface-typed parameters aren't validated.
- Throw `ApplicationError` (400, or `data.statusCode`), or `HttpException` with an **object** response (`{ message, statusCode }`). A string response becomes a 500.
- A public route (no login) must be in the module config's `anonymousAccessRoutes`.

## Adding a domain service

1. Extend `DomainEntityService<Entity, MainDataService, Data?, AdditionalServices?>` and call `super(mainDataService, undefined, logger, { cache, ... })` - the second argument is the enabled methods, not the logger.
2. Export it from the domain module's services index file (name ending with `Service`).
3. For additional data services, remember `runOnNoFirstServiceResultOnly` defaults to `true` - creates don't reach them without an override.

## Adding an API module

1. Extend `HTTPAPIModule` with static `moduleOptions` (`folderData`, `moduleClass`, `moduleName`, `providers`).
2. For protected routes, provide `ACCESS_CONTROL_MODULE_NAME` and the authorization, authentication manager and token manager services. An API with only `anonymousAccessRoutes` needs none of them (see `apps/first-steps`).
3. Add `config.api.<moduleName>` (`hostname`, `port`, `allowedOrigins`, `anonymousAccessRoutes`, ...).
4. Import `APIXModule.register(APIXModule.moduleOptions)` in its own app module and add it to `NodeCApp.start`'s `apiModulesOptions`.

## Checking a change

- Test with the e2e suite. Calls with a non-admin user show permission problems that admin calls hide.
- For query string requests, remember that `qs` parses only 5 levels deep.
- Unknown routes return the middleware's empty 401 when there's no valid token - don't read it as an auth bug.
- Renewed tokens come back in the response's `Authorization` header.
