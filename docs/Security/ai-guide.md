# AI Guide - Security

Checklists for working on authentication and permissions. See the [main AI guide](../ai-guide.md) for the repo map and conventions, and the [Fundamentals AI guide](../Fundamentals/ai-guide.md) for a table of failed-request causes.

## Key files

| Concern | File |
|---|---|
| Request authentication | `packages/api-http/src/middlewares/http.middlewares.authorization.ts` |
| Access control | `packages/api-http/src/interceptors/http.interceptors.accessControl.ts` |
| Permission evaluation | `packages/domain-iam/src/services/authorization/iam.authorization.service.ts` |
| Login | `packages/domain-iam/src/services/authenticationManager/iam.authenticationManager.service.ts` |
| Tokens | `packages/domain-iam/src/services/tokenManager/iam.tokenManager.service.ts` |
| Login methods | `packages/domain-iam/src/services/authentication*/`, `packages/domain-iam-okta/src/services/authenticationOkta/` |
| CORS | `packages/api-http/src/middlewares/http.middlewares.cors.ts` |
| User with permissions (reference app) | `apps/test/src/domain/iam/services/users/users.service.ts` |
| Permission seeds (reference app) | `apps/test/src/data/db/seeds/common/` |

## Before changing a permission

1. List the user's permissions for the same module and resource context in id order - only the first one that passes applies.
2. Check that every `userFieldName` relation is loaded in `getUserWithPermissionsData`.
3. Check that every input path starts with `body`, `headers`, `params` or `query`, and that it exists *before* DTO validation (access control sees the raw input).
4. Anchor regexes with `^...$`.
5. Remember the user has to log in again to get the new permissions.

## Before changing authentication

1. Find the auth service's default step config (`getUserAuthenticationConfig`) - most behaviour is driven by it, and overrides go in `authServiceSettings.<authType>.steps`.
2. New public routes (sign-up, callbacks) go in `anonymousAccessRoutes`.
3. Keep every failure as `ApplicationError('Authentication failed.')` and log the reason - don't leak it to the client.
4. MFA has no implementation - an `IAMMFAService` subclass has to be written and passed to the user-local auth service.
5. An API module without IAM providers only serves anonymous routes - adding protected routes means providing the authorization service, token manager and (to load users) authentication manager.

## Things that are easy to get wrong

- Access control runs before the handler's DTO validation, so query values are still strings (`testValue` compares them as numbers and booleans too).
- `req.locals.user` comes from the id token, not the database - permission and relation changes need a new login. The users cache can make even a new login stale.
- Only the granting permission's output rules apply, and `forbiddenInputData` clears the whole field, not just the matching items.
- A route param is `params.id`, not `query.params.id` - a path that never exists is *set* from the user value and grants access.
- The 403 body never says why access was denied - only the log does.
- API-key requests skip access control entirely - always set `allowedApiKeyRoutes`.
