# Contributing

How to build, check and test the NodeC monorepo. Contributions to the framework itself are made and reviewed by people - the AI guides in these docs are meant for building apps _on_ the framework.

&nbsp;

## Requirements

- Node.js 22 or later, npm 12 or later
- For the e2e tests and the reference app: MySQL (3306), ClickHouse (8123) and two Redis/Valkey instances (6379 and 6380)
- Env files in `apps/test/envFiles/.<env>.env` (gitignored - see <a href='./Architecture/configuration.md' target='_blank'>Configuration</a> for the variable format)

&nbsp;

## Repository layout

An npm workspace with `packages/*` (the published `@node-c/*` packages) and `apps/*` (the reference app, `@node-c/app-test`). Packages depend on each other through the workspace, so a package always uses the **built** `dist` of its dependencies.

```mermaid
flowchart LR
  pino[nestjs-pino] --> core
  core --> rdb[data-rdb]
  rdb --> typeorm[data-typeorm]
  rdb --> ch[data-clickhouse]
  core --> redis[data-redis]
  core --> iam[domain-iam]
  iam --> okta[domain-iam-okta]
  iam --> http[api-http]
  http --> rest[api-rest]
  typeorm & ch & redis & okta & rest --> app[apps/test]
```

&nbsp;

## Building

```bash
npm install
npm run build:clean:all   # every package and apps/test.
```

Per package (`npm run <script> --workspace=packages/<name>`):

| Script                              | What it does                                                           |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `build` / `build:clean`             | Compile with `tsc -p tsconfig.build.json` (clean: delete `dist` first) |
| `build:watch` / `build:watch:clean` | Compile in watch mode                                                  |
| `check-types`                       | Type check without emitting                                            |
| `lint` / `lint:fix`                 | Biome checks                                                           |
| `format` / `format:check`           | Biome formatting                                                       |
| `publish-package`                   | Clean build and publish to npm                                         |

Root scripts: `lint:all`, `lint:all:parallel`, `lint:fix:all:parallel`, `publish-package:all`, `clean-dependencies`.

After changing a package, rebuild it **and everything that depends on it** before running the app or the tests - they load the compiled code.

&nbsp;

## Code conventions

- ESM everywhere (`"type": "module"`); relative imports end in `.js`.
- TypeScript 7. No `any`.
- Types and interfaces go in a `<name>.definitions.ts` file next to the code that uses them.
- No barrel `index.ts` files. Folders that are imported as a whole (`import * as FolderData`) have a named index file (`db.entities.ts`, `coursePlatformDelegated.services.ts`) - see <a href='./Architecture/core-utilities.md' target='_blank'>loadDynamicModules</a>.
- Biome is the linter and formatter - run `lint` before submitting.

&nbsp;

## Testing

```bash
npm run test                  # e2e suite: recreates the databases, starts the apps from dist, runs the specs
npm run test:report-coverage  # coverage report in coverage/report
```

See <a href='./Testing/e2e.md' target='_blank'>End-to-end tests</a>.

&nbsp;

## Running the reference app

```bash
npm run build:clean:all
NODE_ENV=local npm run start:dev --workspace=apps/test   # node --watch dist/main.js
```

With the `local` profile (`apps/test/src/config/profiles/config.profile.local.ts`), the APIs listen on 2070 (course platform, delegated), 2060 (federated), 2050 (standalone) and 2080 (SSO). The e2e profile uses the same ports plus one.

&nbsp;

## Releasing

Releasing is done by the main contributors, after your code is merged.
