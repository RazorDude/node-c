# 1.0.0-alpha55
- `packages/persistance-redis`
  - BREAKING: entitySchema now has name and storeKey.
  - Repositroy service - fixes for the individualSearch functionality.
  - Repositroy service - Fixed an issue with find where incorrect handles are constructed when findAll is enabled.
  - Repositroy service - general fixes.
  - MAJOR UPDATE: added support for array-based storage.
  - MAJOR UPDATE: added support for array-based storage in nested objects.
- `apps/test`
  - Overall redis entity fixes in accordance with the entity fixes in persistance-redis.
  - Auth fixes in accordance with the redis changes for individualSearch.

# 1.0.0-alpha54
- `packages/core`
  - WIP: support for supplying default options for triggering additional persistance entity services in the domain entity service.
- `packages/persistance-typeorm`
  - Changed how failOnConnectError works - the default retry machisms of the underlying npm packages are only affected when failOnConnectError is set to false.
- `packages/persistance-redis`
  - Changed how failOnConnectError works - the default retry machisms of the underlying npm packages are only affected when failOnConnectError is set to false.
  - MAJOR UPDATE: added support for individualSearch in find (off by default), circumventing the issue with non-deterministic SCAN results.
- `apps/test`
  - Auth updates in accordance with the redis changes for individualSearch.

# 1.0.0-alpha53
- `packages/core`
  - BREAKING: getNested now returns paths and values, rather than just values, allowing for the correct processing of nested array objects.
  - WIP: support for supplying default options for triggering additional persistance entity services in the domain entity service.
- `packages/persistance-clickhouse`
  - Added 2 new column types - Enum and JSON.
  - Added a generic type argument for the entity class to the repository and relevant types.
- `packages/domain-iam`
  - Added support for processing output data, on top of the current input data processing.
- `packages/api-http`
  - Renamed the exceptionFilters folder to just filters.
  - Added output processing functionality to the authorization interceptor.
- `apps/test`
  - Minor e2e test improvements.
  - New migrations so that the permissions system changes can be tested.


# 1.0.0-alpha52
- Everything that was done up until this point :)
