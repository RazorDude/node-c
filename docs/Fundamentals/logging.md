# Logging

NodeC logs through [pino](https://getpino.io), wrapped in a NestJS `LoggerService`. The framework logs the real reason for most failures the API deliberately hides - why a login failed, which permission check denied a request, which database error happened - so the log is the first place to look when a request doesn't do what you expect.

```typescript
@Module({
  imports: [
    ConfigProviderModule.register(AppModuleBase.configProviderModuleRegisterOptions),
    LoggerModule.register(), // the default params: logs/app_logs.txt + pretty output on stdout
    // ...
  ]
})
export class AppModule extends AppModuleBase {}
```

Then inject it anywhere:

```typescript
constructor(protected logger: LoggerService) {}

this.logger.info('Task created.', { taskId: task.id });
this.logger.error('Could not reach the payment provider:', err);
```

## Options

`LoggerModule.register({ pinoParams? })` takes the full [nestjs-pino params](https://github.com/iamolegga/nestjs-pino#configuration) - they replace the defaults rather than being merged with them. To change one setting, spread `DEFAULT_PINO_PARAMS`:

```typescript
LoggerModule.register({
  pinoParams: {
    ...DEFAULT_PINO_PARAMS,
    pinoHttp: {
      ...DEFAULT_PINO_PARAMS.pinoHttp,
      transport: {
        targets: [
          { target: 'pino/file', options: { destination: `logs/app_logs_${process.env.NODE_ENV}.txt`, mkdir: true } },
          { target: 'pino-pretty', options: { destination: 1 } }
        ]
      }
    }
  } as Params
})
```

`DEFAULT_PINO_PARAMS`:
- writes JSON lines to `logs/app_logs.txt` (the folder is created if it's missing) and pretty-prints to stdout
- gives every request a UUID request id (`reqId` in the JSON lines)
- logs requests and responses quietly (`quietReqLogger`, `quietResLogger`)

## What the framework logs

| Source | Example |
|---|---|
| `HTTPRequestLoggingMiddleware` | `[tasks]: GET /tasks` for every request |
| Authorization middleware | `Missing authorization token.`, `AUTH_INVALID` |
| Access control | `[coursePlatform][HTTPAccessControlInterceptor]: No user access to resource coursePlatform.<context>.<resource> - FGA_NO_ACCESS.` |
| Authentication | `[Domain.iam.AuthenticationManager][userLocal]: Login attempt failed ...` |
| Error interceptor | every error thrown by a handler, with its stack |
| Data modules | connection attempts and failures |

> [!TIP]
> The JSON log lines carry the request id, so you can follow one request through every component with `grep <reqId> logs/app_logs.txt`.

---

Previous: [Configuration](./configuration.md) · Next: [Multiple data services](./multiple-data-services.md)
