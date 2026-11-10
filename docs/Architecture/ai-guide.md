# AI Guide - Architecture

Checklists for working on the request pipeline, authentication and permissions. See the <a href='../ai-guide.md' target='_blank'>main AI guide</a> for the repo map and conventions.

&nbsp;

## Key files

| Concern | File |
|---|---|
| Request authentication | `packages/api-http/src/middlewares/http.middlewares.authorization.ts` |
| Access control | `packages/api-http/src/interceptors/http.interceptors.accessControl.ts` |
| Error responses | `packages/api-http/src/interceptors/http.interceptors.error.ts` |
| Permission evaluation | `packages/domain-iam/src/services/authorization/iam.authorization.service.ts` |
| Login | `packages/domain-iam/src/services/authenticationManager/iam.authenticationManager.service.ts` |
| Tokens | `packages/domain-iam/src/services/tokenManager/iam.tokenManager.service.ts` |
| Multi-data-service logic | `packages/core/src/domain/entityService/domain.entity.service.ts` |
| Login methods | `packages/domain-iam/src/services/authentication*/`, `packages/domain-iam-okta/src/services/authenticationOkta/` |
| Config loading, env mapping | `packages/core/src/common/configProvider/configProvider.service.ts` (+ `.definitions.ts` for every option) |
| App startup | `packages/core/src/app.ts` |
| `getNested` / `setNested` / `loadDynamicModules` | `packages/core/src/common/utils/` |
| User with permissions (reference app) | `apps/test/src/domain/iam/services/users/users.service.ts` |
| App modules and env key maps (reference app) | `apps/test/src/app.module.ts` |
| Config (reference app) | `apps/test/src/config/config.common.ts`, `apps/test/src/config/profiles/` |

&nbsp;

## Debugging a failed request

| Response | Where it comes from | What to check |
|---|---|---|
| 401, empty body | Authorization middleware | Token missing, invalid or expired; route not in `anonymousAccessRoutes`; the route doesn't exist |
| 403, empty body | Authorization middleware (API keys) | Wrong key or signature; route not in `allowedApiKeyRoutes` |
| 403 `{ error: 'Forbidden', statusCode: 403 }` | Access control interceptor (formatted by the exception filter) | The `No user access to resource ... - <errorCode>` log line - then the permissions, in id order |
| 400 `{ error: 'Authentication failed.' }` | Authentication manager | The `[Domain.<module>.AuthenticationManager]` log lines |
| 400/500 `{ error, statusCode }` | Error interceptor | The error message - DTO validation, data layer or domain errors |
| 404 `Not found` | REST controller | The route isn't enabled (DTOs / `defaultRouteMethods`) |

&nbsp;

## Before changing a permission

1. List the user's permissions for the same module and resource context in id order - only the first one that passes applies.
2. Check that every `userFieldName` relation is loaded in `getUserWithPermissionsData`.
3. Check that every input path starts with `body`, `headers`, `params` or `query`, and that it exists *before* DTO validation (access control sees the raw input).
4. Anchor regexes with `^...$`.
5. Remember the user has to log in again to get the new permissions.

&nbsp;

## Before adding a module or a config option

1. Add the module's section to `config.common.ts` (and the profiles, for per-environment values).
2. If it reads anything from the environment, add its name to `envKeysParentNames` and its fields to `envKeys` in the app module, and declare `<CATEGORY>_<MODULE>_MODULE_TYPE` in the env files.
3. Parse numbers and booleans that come from the environment - they're strings.
4. Import the module in every app module that needs it.

&nbsp;

## Before changing authentication

1. Find the auth service's default step config (`getUserAuthenticationConfig`) - most behaviour is driven by it, and overrides go in `authServiceSettings.<authType>.steps`.
2. New public routes (sign-up, callbacks) go in `anonymousAccessRoutes`.
3. Keep every failure as `ApplicationError('Authentication failed.')` and log the reason - don't leak it to the client.
4. MFA has no implementation - an `IAMMFAService` subclass has to be written and passed to the user-local auth service.

&nbsp;

## Things that are easy to get wrong

- Access control runs before the handler's DTO validation, so query values are still strings (`testValue` compares them as numbers and booleans too).
- `req.locals.user` comes from the id token, not the database - permission and relation changes need a new login. The users cache can make even a new login stale.
- `runOnNoFirstServiceResultOnly` defaults to `true` - additional data services don't run when the first one found (or created) something, and update/delete only run them when the first one changed something.
- `getNested` returns `undefined` for a path through an empty array, and a plain value (not an array) for a single match.
- Only the granting permission's output rules apply, and `forbiddenInputData` clears the whole field, not just the matching items.
- A route param is `params.id`, not `query.params.id` - a path that never exists is *set* from the user value and grants access.
- The 403 body never says why access was denied - only the log does.
