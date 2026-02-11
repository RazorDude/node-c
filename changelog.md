# 1.0.0-alpha63
- Common
- `packages/domain-iam`
  - Typing and typo fixes for the authorization service.

# 1.0.0-alpha62
- Common
  - BREAKING: Renamed all "persistance" packages whose name is confusing, misleading, factually inaccurate and - worst of all - contains a typo. They're now "data" packages.
- `packages/domain-iam`
  - BREAKING: Renamed the authentication middleware into the authorization middleware, as it actually does authorization, not authentication.
  - Moved the authorization of api keys and bearer tokens into the authorization serivce (from the api-http pacakge).
  - Fixed the issue with DomainIAMAuthorizationService.checkAccess in the case where inputFieldData needs to be compared to userFieldData and there is no mutation necessary.
  - WIP - OAuth2.0 and OIDC flows.
- `packages/domain-iam-okta`
  - WIP - First working version.
- `apps/test`
  - Fixes for the breaking changes.

# 1.0.0-alpha61
- `packages/persistance-rdb`
  - Fixed the delete method for services whose entities don't have a deletedColumn.

# 1.0.0-alpha60
- `packages/persistance-rdb`
  - QueryBuilder fix for association fields with aliases.

# 1.0.0-alpha59
- Publishing errror fix.

# 1.0.0-alpha58
- `packages/persistance-rdb`
  - Debug log removal.

# 1.0.0-alpha57
- `packages/persistance-redis`
  - Repository - full support for nested objects and arrays for find operations.
  - Repository - support for nested objects and arrays for delete operations WIP.
  - Repository - big performance optimizations for find queries.
  - EntityService - support for multi-item update.
- `packages/persistance-rdb`
  - Fixed the filtering by multiple operators.

# 1.0.0-alpha56
- `packages/api-rest`
  - Delete DTO - added the missing "returnOriginalItems" property.
- `packages/core`
  - DomainEntityServices.delete - fixed the issue where returnOriginalItems does not pass the "items" arg to the runMethodInAdditionalServices method correctly.
- `packages/persistance-rdb`
  - RDBEntityService - fixed the issue where "in" SQL search is borken.

# 1.0.0-alpha55
- `packages/persistance-redis`
  - BREAKING: entitySchema now has name and storeKey.
  - Repository service - fixes for the individualSearch functionality.
  - Repository service - Fixed an issue with find where incorrect handles are constructed when findAll is enabled.
  - Repository service - general fixes.
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
