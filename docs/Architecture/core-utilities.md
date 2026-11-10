# Core Utilities

`@node-c/core` exports a few utilities that the rest of the framework is built on. Their exact behaviour matters, because permissions, output rules, config loading and module registration all depend on it.

&nbsp;

## `getNested(parent, path, options?)`

Reads a value at a dot-separated path, going **through arrays**.

```typescript
getNested({ user: { assignedCourses: [{ id: 1 }, { id: 4 }] } }, 'user.assignedCourses.id');
// { paths: ['user.assignedCourses.0.id', 'user.assignedCourses.1.id'], values: [1, 4], unifiedValue: [1, 4] }

getNested({ query: { filters: { id: '3' } } }, 'query.filters.id');
// { paths: ['query.filters.id'], values: ['3'], unifiedValue: '3' }

getNested({ user: { assignedCourses: [] } }, 'user.assignedCourses.id');
// { paths: [], values: [], unifiedValue: undefined }
```

- **`unifiedValue`** is what most callers use: the single value when exactly one was found, an array when there were several, `undefined` when nothing was found.
- When the path continues past an array, it's applied to every item, and the results are flattened. A numeric segment (`items.0.id`) reads one index instead.
- When the path *ends* on an array, the array itself is the value.
- `paths` gives the concrete path of each value, with array indexes filled in.
- **Escaping dots** - a segment wrapped in `$...$` is one key: `filters.$courseType.name$` reads the key `courseType.name` inside `filters`. With `removeNestedFieldEscapeSign: true`, the `$` signs are removed from the key before reading it.
- `arrayItemsShouldBeUnique: true` drops duplicate values.

&nbsp;

## `setNested(parent, path, value, options?)`

Writes a value at a dot-separated path and returns whether anything was set.

- Missing intermediate objects are created.
- When the path continues past an array (without an index), the value is set **in every item** - this is how output rules like `result.items.deletedAt` apply to every found item.
- Supports the same `$...$` escaping and `removeNestedFieldEscapeSign` option as `getNested`.
- `setNestedArraysPerIndex` is accepted but not implemented yet.

&nbsp;

## `loadDynamicModules(folderData, options?)`

Turns the exports of an index file (`import * as FolderData from './entities/db.entities.js'`) into NestJS building blocks, **by export name**:

| Export name ends with | Goes into | Used by |
|---|---|---|
| `Controller` | `controllers` | HTTP API modules |
| `Entity` | `entities` | TypeORM data modules, generated datasource files |
| `Module` | `modules` - `register(options)` is called if the class has it | data modules (entity modules) |
| `Service` | `services` | domain modules, HTTP API modules |

- Names starting with `base` are skipped.
- Anything else (interfaces, constants, schemas like `DataCacheCourseSchema`) is ignored.
- A controller or service with a static `injectionToken` is also registered under that token.
- `options.moduleRegisterOptions` / `options.registerOptionsPerModule[exportName]` are passed to the modules' `register`.

&nbsp;

## `httpRequest(url, data)`

An axios wrapper used for calls to other services (OAuth2 providers, other NodeC apps):
- `method` (default GET), `query` (GET) or `body` (other methods), `headers`, `isJSON`, `isFormData`, `axiosConfig`
- `apiKey` (+ `apiSecret` and `apiSecretHashingAlgorithm`) - sends `Authorization: ApiKey <key> <HMAC signature>`, the format the authorization middleware expects
- returns `{ data, hasError, statusCode }`, or the full response with `returnFullResponse`. `throwOnError` throws an `ApplicationError` for 4xx/5xx - but note that axios itself already rejects on 4xx/5xx, unless `axiosConfig.validateStatus` allows them.

&nbsp;

## Other exports

- `ApplicationError` - the error class to throw from domain and data code. `new ApplicationError(message, { statusCode })` sets the HTTP status (`errorCode` takes precedence over `statusCode`; 400 if neither is set). It doesn't extend `Error`, so there's no stack trace and `instanceof Error` is `false`.
- `base64UrlEncode(buffer | string)` - URL-safe base64 without padding (used for PKCE).
- `ConfigProviderService`, `LoggerService`, `NodeCApp` - see <a href='./configuration.md' target='_blank'>Configuration, startup and logging</a>.
- `DomainEntityService`, `DataEntityService` - see <a href='./domain-services.md' target='_blank'>Domain services</a>.
