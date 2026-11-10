# HTTP API Module

`HTTPAPIModule` (from `@node-c/api-http`) is the base of every HTTP API module. It registers the controllers, sets up the request pipeline and provides the authorization services that the middleware and interceptors use.

&nbsp;

## Defining an API module

```typescript
@Module({})
export class APICoursePlatformDelegatedModule extends HTTPAPIModule {
  static readonly moduleOptions: HTTPAPIModuleOptions = {
    folderData: FolderData, // the controllers index file
    moduleClass: APICoursePlatformDelegatedModule,
    moduleName: 'coursePlatformDelegated', // config.api.<moduleName>
    providers: [
      { provide: NodeCDomainIAMConstants.ACCESS_CONTROL_MODULE_NAME, useValue: 'coursePlatform' },
      { provide: NodeCAPIHTTPConstants.API_MODULE_AUTHORIZATION_SERVICE, useExisting: DomainIAMAuthorizationService },
      { provide: NodeCAPIHTTPConstants.AUTHORIZATION_MIDDLEWARE_AUTHENTICATION_MANAGER_SERVICE, useExisting: DomainIAMAuthenticationManagerService },
      { provide: NodeCAPIHTTPConstants.AUTHORIZATION_MIDDLEWARE_TOKEN_MANAGER_SERVICE, useExisting: DomainIAMTokenManagerService }
    ]
  };
}

// in the app module's imports:
APICoursePlatformDelegatedModule.register(APICoursePlatformDelegatedModule.moduleOptions)
```

Options: `folderData`, `moduleClass`, `moduleName`, `providers`, `controllers` (in addition to the ones in `folderData`), `exports`, `imports: { atStart, atEnd }`.

- `ACCESS_CONTROL_MODULE_NAME` is the `moduleName` that permissions must use. Several API modules can share one (the reference app's three course platform APIs all use `coursePlatform`). Always provide it: the interceptor falls back to the API module name only when the provider's value is empty, and a missing provider fails the lookup.
- The authentication manager provider is optional. Without it, the middleware still verifies tokens, but doesn't require a `userId` and doesn't load users.

&nbsp;

## The request pipeline

```mermaid
flowchart TD
  R[Request] --> P1[urlencoded + JSON body parsers<br/>raw body kept in req.rawBody]
  P1 --> P2[cookie-parser]
  P2 --> L[HTTPRequestLoggingMiddleware]
  L --> CO[HTTPCORSMiddleware]
  CO -- OPTIONS --> OK200[200, empty]
  CO --> AU[HTTPAuthorizationMiddleware]
  AU -- fails --> E401[401/403, empty body]
  AU --> RT[Routing]
  RT --> AC[HTTPAccessControlInterceptor]
  AC --> EI[HTTPErrorInterceptor]
  EI --> VP["Global ValidationPipe({ whitelist: true })<br/>for DTO-typed parameters"]
  VP --> H[Handler]
  AC -. exceptions .-> F[HttpExceptionFilter]
  RT -. 404 .-> F
  F --> EJ["{ error, statusCode }"]
```

| Piece | What it does |
|---|---|
| Body parsers | `express.urlencoded` and `express.json` for all routes. The raw body string is kept in `req.rawBody` (for signature checks and webhooks). NestJS's own body parser is disabled. |
| `HTTPRequestLoggingMiddleware` | Logs `[<moduleName>]: <METHOD> <path>` |
| `HTTPCORSMiddleware` | Sets `Access-Control-Allow-Origin` to the request's `Origin` if it's in `config.api.<module>.allowedOrigins`, allows credentials and the usual methods and headers, exposes the `Authorization` header (for renewed tokens) and answers `OPTIONS` with 200 |
| `HTTPAuthorizationMiddleware` | Anonymous routes, API keys and bearer tokens - see <a href='../Architecture/authentication.md' target='_blank'>Authentication</a> |
| `HTTPAccessControlInterceptor` | Permissions - see <a href='../Architecture/access-control.md' target='_blank'>Access Control</a> |
| `HTTPErrorInterceptor` | Errors thrown by the handler → `{ error, statusCode }` |
| Global `ValidationPipe` | Validates and whitelists parameters typed with DTO classes |
| `HttpExceptionFilter` (global) | Everything else that's thrown (access control 403s, Nest's 404s, errors in other interceptors or pipes) → `{ error: message, statusCode }` |

The interceptors are applied by `RESTAPIEntityController` with `@UseInterceptors(HTTPAccessControlInterceptor, HTTPErrorInterceptor)`. A controller that doesn't extend it must add them itself.

&nbsp;

## Config

`config.api.<moduleName>`: `hostname`, `port`, `allowedOrigins`, `anonymousAccessRoutes`, `allowedApiKeyRoutes`, `apiKey`, `apiSecret`, `apiSecretAlgorithm`, `localSearchForUsersEnabledOnAuthorization`. See <a href='../Architecture/configuration.md' target='_blank'>Configuration</a> for where the values come from.

&nbsp;

## File uploads

`@node-c/api-rest` exports an `UploadFileDto` (`contentType` - a valid MIME type - and `name`) for routes that accept file metadata, e.g. to create a signed upload URL. There's no built-in upload route or multipart handling.
