# AI Guide - Fundamentals

Checklists for working on configuration, startup, logging, multi-data-service calls and the request pipeline. See the [main AI guide](../ai-guide.md) for the repo map and conventions, and the [Security AI guide](../Security/ai-guide.md) for authentication and permissions.

## Key files

| Concern | File |
|---|---|
| Config loading, env mapping | `packages/core/src/common/configProvider/configProvider.service.ts` (+ `.definitions.ts` for every option) |
| App startup | `packages/core/src/app.ts` |
| Datasource file generation script (needs `AppModuleBase` in `dist/app.module.js`) | `packages/core/src/scripts/generateDatasourceFiles.ts` |
| Logger and default pino params | `packages/core/src/common/logger/logger.service.ts` |
| Multi-data-service logic | `packages/core/src/domain/entityService/domain.entity.service.ts` |
| `getNested` / `setNested` / `loadDynamicModules` | `packages/core/src/common/utils/` |
| API module, middleware order, global pipe and filter | `packages/api-http/src/module/http.api.module.ts` |
| Error responses | `packages/api-http/src/interceptors/http.interceptors.error.ts`, `packages/api-http/src/filters/http.filtes.exception.ts` |
| Minimal app (no IAM) | `apps/first-steps/src/` |
| App modules and env key maps (reference app) | `apps/test/src/app.module.ts` |
| Config (reference app) | `apps/test/src/config/config.common.ts`, `apps/test/src/config/profiles/` |

## Debugging a failed request

| Response | Where it comes from | What to check |
|---|---|---|
| 401, empty body | Authorization middleware | Token missing, invalid or expired; route not in `anonymousAccessRoutes`; the route doesn't exist; no authorization service provided |
| 403, empty body | Authorization middleware (API keys) | Wrong key or signature; route not in `allowedApiKeyRoutes` |
| 403 `{ error: 'Forbidden', statusCode: 403 }` | Access control interceptor (formatted by the exception filter) | The `No user access to resource ... - <errorCode>` log line - then the permissions, in id order |
| 400 `{ error: 'Authentication failed.' }` | Authentication manager | The `[Domain.<module>.AuthenticationManager]` log lines |
| 400/500 `{ error, statusCode }` | Error interceptor | The error message - DTO validation, data layer or domain errors |
| 404 `{ error: 'Not found' }` | REST controller | The route isn't enabled (DTOs / `defaultRouteMethods`) |

## Before adding a module or a config option

1. Add the module's section to `config.common.ts` (and the profiles, for per-environment values).
2. If it reads anything from the environment, add its name to `envKeysParentNames` and its fields to `envKeys` in the app module, and declare `<CATEGORY>_<MODULE>_MODULE_TYPE` in the env files.
3. Parse numbers and booleans that come from the environment - they're strings.
4. Import the module in every app module that needs it.
5. Keep the `ConfigProviderModule` options in `AppModuleBase.configProviderModuleRegisterOptions` in `src/app.module.ts` - the datasource script reads them from there.

## Things that are easy to get wrong

- `runOnNoFirstServiceResultOnly` defaults to `true` - additional data services don't run when the first one found (or created) something, and update/delete only run them when the first one changed something.
- `getNested` returns `undefined` for a path through an empty array, and a plain value (not an array) for a single match.
- `LoggerModule.register({ pinoParams })` replaces the default params - spread `DEFAULT_PINO_PARAMS` to keep them, and set `mkdir: true` on file targets.
- `@node-c/core` and `@node-c/data-typeorm` declare their CLI bins as `node ./dist/...` strings, which npm doesn't link - call the scripts by path (`node node_modules/@node-c/core/dist/scripts/generateDatasourceFiles.js`) and use TypeORM's own `typeorm` CLI.
