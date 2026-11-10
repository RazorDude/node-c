# FAQ and Troubleshooting

Find the symptom, then the cause and the fix. When nothing here matches, look in the log first - the framework logs the real reason for most failures that the API response hides (see [Logging](./Fundamentals/logging.md)).

## Requests and responses

**I get a 401 with an empty body.**
The authorization middleware rejected the request: no token, an expired token, or a route that isn't in `anonymousAccessRoutes`. This also happens for routes that don't exist, because the middleware runs before routing. Check the URL and method, and the token. See [Authentication](./Security/authentication.md#authenticating-requests).

**I get a 404 on a route that should exist.**
The default route isn't enabled - the controller passed no DTO for it, or it's missing from `defaultRouteMethods`. See [Controllers](./Overview/controllers.md#routes).

**I get `{ error: 'Forbidden', statusCode: 403 }`.**
Access control denied the request. The log line `No user access to resource <module>.<context>.<resource> - <errorCode>` says which check failed - see [Access Control](./Security/access-control.md#how-a-check-is-evaluated).

**I throw an `HttpException` with a 4xx status, and the client gets a 500.**
The exception has a string response. Use an object: `new HttpException({ message, statusCode }, statusCode)`, or throw an `ApplicationError` with `{ statusCode }`.

**My bracketed query string is ignored, or curl sends nothing.**
Pass `-g` to curl - it treats `[...]` as a glob pattern otherwise. Also note that the query string is only parsed 5 levels deep.

**A boolean filter like `filters[done]=false` matches nothing (or the wrong rows).**
Query string values are strings. SQLite doesn't convert `'false'` to a boolean, and MySQL converts any non-numeric string to `0`. Use `0` and `1` in the query string, or send typed filters from code.

**`Forbidden include item` errors.**
A relation used in `filters`, `select` or `orderBy` isn't in `include` - or the permission's input rules removed it from `include`. See [Query filters](./Data/query-filters.md).

## Data

**A new entity, module or service isn't found ("Nest can't resolve dependencies"), or a route is missing.**
It isn't exported from its folder's index file, or its export name doesn't end with `Entity`, `Module`, `Service` or `Controller`. See [Layers and modules](./Overview/layers.md#folder-layout).

**`create` with `dataServices: ['main', 'cache']` doesn't write to the cache.**
Additional services are skipped when the first service returned a result - and a successful create always does. Pass `optionsOverridesByService: { cache: { runOnNoFirstServiceResultOnly: false } }`. See [Multiple data services](./Fundamentals/multiple-data-services.md).

**Redis items never expire.**
`useHashmap` is `true` (the default) on the data module - TTLs only apply with `useHashmap: false`. See [Redis / Valkey](./Data/redis.md#how-items-are-stored).

**`The primary key field X is required ...` from Redis.**
Redis updates and deletes need the primary keys in the filters. See [Redis / Valkey](./Data/redis.md#behaviour).

**`Method ClickHouseSelectQueryBuilder.X not implemented.`**
ClickHouse supports inserts, finds and counts only - no updates, deletes or joins. See [ClickHouse](./Data/clickhouse.md).

**My seed or migration has no effect.**
Migrations and seeds run from `dist` - rebuild the app first. Also check that its timestamp is later than the migrations it depends on. See [Seeding data](./Recipes/seeding-data.md).

**`sqlite3` fails to load ("Could not locate the bindings file").**
Its install script was blocked by npm. Run `npm install-scripts approve sqlite3` and `npm rebuild sqlite3`.

## Logins and permissions

**I changed a user's roles or permissions, and nothing changed.**
The user is taken from the id token issued at login - the user has to log in again. A new login can still return a cached user for a while. See [Authentication](./Security/authentication.md).

**A user with an assigned resource still gets a 403.**
The relation the permission's `userFieldName` reads isn't loaded on the user, or it's empty (for example, all assigned rows are soft-deleted). See [Access Control](./Security/access-control.md).

**A permission allows more than it should.**
Usually an unanchored regular expression (`/lessons/` instead of `/^lessons$/`), or an input path that never exists (`query.params.id` instead of `params.id`) - a missing input value is *set* from the user's value, which grants access.

**Every login fails with `Authentication failed.`**
That message is deliberately the same for every failure. The log line from `[Domain.<module>.AuthenticationManager]` has the reason.

## Configuration

**A config value is `undefined` at runtime.**
For values from the environment: the `<CATEGORY>_<MODULE>_MODULE_TYPE` variable is missing, or the module name isn't in `envKeysParentNames`. For values from files: the profile's export name doesn't match `NODE_ENV`. See [Configuration](./Fundamentals/configuration.md).

**A port or number from the environment behaves like a string.**
It is one - parse values from the environment before using them.

**The app crashes with `ENOENT ... logs/app_logs.txt`.**
You're passing your own `pinoParams` with a `pino/file` target - add `mkdir: true` to its options, or create the folder. See [Logging](./Fundamentals/logging.md).

---

Previous: [End-to-end tests](./Testing/e2e.md) · Next: [Glossary](./glossary.md)
