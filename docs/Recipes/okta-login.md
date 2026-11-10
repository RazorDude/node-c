# Logging in with Okta

Let users log in with Okta (OAuth2 + OpenID Connect, with PKCE), and have NodeC create the local user on their first login. The reference app's IAM domain (`apps/test/src/domain/iam`) and SSO API do this. For the flow itself, see [Authentication](../Security/authentication.md#oauth2-and-okta).

## 1. Create the Okta app

In Okta, create an OIDC **web application** with the authorization code grant and PKCE, and set its redirect URI to your app's callback route, e.g. `http://localhost:2080/users/auth/okta`.

## 2. Configure it

```typescript
// config.common.ts - domain.iam.authServiceSettings
okta: {
  oauth2: { codeChallengeMethod: 'S256', defaultScope: 'openid profile email groups offline_access', verifyTokensLocally: true }
}

// config.profile.<env>.ts - domain.iam.authServiceSettings
okta: {
  oauth2: {
    accessTokenAudiences: ['https://<your-org>.okta.com'],
    accessTokenGrantUrl: 'https://<your-org>.okta.com/oauth2/v1/token',
    authorizationUrl: 'https://<your-org>.okta.com/oauth2/v1/authorize',
    issuerUri: 'https://<your-org>.okta.com',
    redirectUri: 'http://localhost:2080/users/auth/okta'
  }
}
```

```bash
# env file
DOMAIN_IAM_OAUTH2_OKTA_CLIENT_ID=...
DOMAIN_IAM_OAUTH2_OKTA_CLIENT_SECRET=...
```

The two env variables need `envKeys` entries that map them to `authServiceSettings.okta.oauth2.clientId` / `clientSecret` - see `apps/test/src/app.module.ts`.

## 3. Add the auth service

```typescript
@Injectable()
export class DomainIAMAuthenticationOktaService extends IAMAuthenticationOktaService<UserFields, UserFields> {
  constructor(configProvider: ConfigProviderService, logger: LoggerService, @Inject(CoreConstants.DOMAIN_MODULE_NAME) moduleName: string) {
    super(configProvider, logger, moduleName, 'okta');
  }

  // the fields a new local user is created with
  async getUserDataFromExternalTokenPayloads(data: PayloadsData): Promise<UserCreateData | null> {
    const userData = await super.getUserDataFromExternalTokenPayloads(data); // email, firstName, lastName
    return userData ? { ...userData, accountStatusId: 1 } : null;
  }
}
```

Then pass it to the authentication manager under the key `okta` - the `:authType` of the login routes:

```typescript
super({ okta: authenticationOktaService, userLocal: authenticationUserLocalService }, configProvider, logger, moduleName, ...);
```

## 4. Open the routes

```typescript
// config.common.ts - api.sso
anonymousAccessRoutes: { '/users/auth/okta': [HttpMethod.GET, HttpMethod.PATCH, HttpMethod.POST] }
```

## 5. Log in

1. `POST /users/auth/okta` returns `{ nextStepsRequired: true, authorizationCodeRequestURL }`.
2. Open the URL in a browser and log in to Okta.
3. Okta redirects to `GET /users/auth/okta?code=...&state=...`, which returns `{ accessToken, idToken, refreshToken, user }`.

> [!WARNING]
> The `state` links the two steps, through the auth cache (`cacheAuth` in the reference app). The cache must be running, and its TTL must be longer than the time a user takes to log in.

> [!TIP]
> Refreshing the Okta access token isn't implemented yet. When the local access token expires, the refresh flow fails for Okta logins and the user has to log in again.

---

Previous: [Seeding data](./seeding-data.md) · Next: [Federated login](./federated-login.md)
