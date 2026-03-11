# 1.0.0-beta0
- Common
  - BREAKING: Renamed all "PERSISTANCE" occurrences into DATA - this was unintentionally omitted in v1.0.0-alpha62.
  - BREAKING: Migration to NestJS v11.
  - Security fixes.
  - WIP: logging via pino.
  - Unpublished the old "persistance" packages.
  - Added the src folder to the npm packages for easier debugging.
- `packages/core`
  - Changes needed for OAuth2 in packages/domain-iam.
  - New utility method for making HTTP requests using axios.
  - New utility method for base64UrlEncode-ing strings.
  - Fixed express apps' parsing of queries and made the query properrty mutable.
- `packages/data-rdb`
  - BREAKING: Include from filters is now being whitelisted based on the explicit include for the query.
- `packages/data-redis`
  - Arrays support in the Repository's set method.
- `packages/domain-iam`
  - BREAKING: access and refresh tokens are now saved as arrays based on the user id, and are being searched for based on that + the token itself in the array.
  - BREAKING: removed the user-centric focus in the authentication services and split the flow into "initiate" and "complete".
  - BREAKING: AuthenticationLocal is now AuthenticationUserLocal
  - BREAKING: AuthenticationPoints - renamed "controllerNames" to "resourceContext" and "handlerNames" to "resources".
  - BREAKING: AuthorizationService - completely reworked the checkAccess method so that it encapsulates the logic for finding the authorizationPoint for the given resource and context.
  - BREAKING: AuthorizationService - removed the mapAuthorizationPoints method.
  - BREAKING: TokenManagerService - rearranged the injected dependencies and added a mandatory authServices dependency.
  - BREAKING: TokenManagerService - the service no longer extends the DomainEntityService, but requires it to be injected instead.
  - TokenManagerService - addded external access token verification based on the used authService.
  - BREAKING: UsersService - renamed to UserManagerService, similar to TokenManager.
  - BREAKING: UsersService - the service no longer extends the DomainEntityService, but requires it to be injected instead.
  - Generic MFA service architecture.
  - WIP: local MFA implementation in a separate service.
  - OAuth2.0 and OIDC flows.
- `packages/domain-iam-okta`
  - First working version.
- `packages/api-http`
  - BREAKING: Renamed the Authorization interceptor to the AccessControl interceptor in order to avoid confusion.
  - Refactoring to accommodate the domain-iam package changes.

# 1.0.0-alpha64
- `packages/core`
  - The setNested method now creates objects along the path when they are missing.
- `packages/domain-iam`
  - Typo fix in the authorization service.

# 1.0.0-alpha63
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
