# API Keys and CORS

Not every caller is a logged-in user. Other services - another NodeC app, a webhook sender, a cron job - can call an API with an **API key** instead of a token, optionally signing each request. And browser apps on another origin need **CORS** headers before they can call the API at all. Both are configured per API module.

## API keys

```typescript
// config.common.ts
api: {
  sso: {
    allowedApiKeyRoutes: { '/users/auth/passthrough': [HttpMethod.PATCH, HttpMethod.POST] },
    apiSecretAlgorithm: 'sha256'
  }
}
```

```bash
# the env file - secrets don't go in the config files
API_SSO_MODULE_TYPE=REST
API_SSO_API_KEY=my-key
API_SSO_API_SECRET=my-secret
```

A caller sends `Authorization: ApiKey <apiKey> [<signature>]`. The authorization middleware:
1. compares the key with `config.api.<module>.apiKey`
2. if `apiSecret` and `apiSecretAlgorithm` are set, checks the signature: the HMAC (with that algorithm and secret) of
   - the query string, for GET requests with a query string
   - the JSON body, for other requests with a body
   - the path, otherwise
3. if `allowedApiKeyRoutes` is set, checks that the path and method are in it
4. sets `req.locals.isApiKeyRoute` - **access control is skipped** for API-key requests

A wrong key or signature, or a route that isn't allowed, gets a 403 with an empty body.

Calling an API-key route from another NodeC app is one call to `httpRequest` from `@node-c/core`, which builds the header and the signature:

```typescript
const { data, hasError } = await httpRequest<PassthroughResult>(`${baseUrl}/users/auth/passthrough`, {
  apiKey,
  apiSecret,
  apiSecretHashingAlgorithm: 'sha256',
  body: { auth: { type: 'passthrough' }, filters: { email } },
  isJSON: true,
  method: HttpMethod.POST
});
```

> [!WARNING]
> Always set `allowedApiKeyRoutes`. Without it, a valid key can call every route of the module - and access control doesn't run for API-key requests.

## CORS

```typescript
// config.profile.<env>.ts
api: { tasks: { allowedOrigins: ['https://app.example.com', 'http://localhost:5173'] } }
```

`HTTPCORSMiddleware` runs on every request and:
- sets `Access-Control-Allow-Origin` to the request's `Origin`, if it's in `allowedOrigins`
- allows credentials, the methods `OPTIONS, GET, POST, PUT, PATCH, DELETE` and the usual request headers (`authorization`, `content-type`, ...)
- exposes the `Authorization` response header, so browser apps can read renewed tokens
- answers `OPTIONS` (preflight) requests with an empty 200

> [!TIP]
> `allowedOrigins` usually differs per environment, so it belongs in the profiles rather than the common config.

---

Previous: [Access Control](./access-control.md) · Next: [Recipes](../Recipes/index.md)
