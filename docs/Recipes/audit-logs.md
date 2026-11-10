# Audit Logs with ClickHouse

Store high-volume, append-only records - login logs, events, metrics - in ClickHouse, and read them through the same filters and REST routes as any other entity. The reference app logs every local login to `userLoginLogs` and exposes the logs at `GET /userLoginLogs`.

Files: `apps/test/src/data/audit`, `apps/test/src/domain/iam/services/authenticationUserLocal`, `apps/test/src/api/coursePlatformDelegated/controllers/userLoginLogs`.

## 1. Create the table

ClickHouse tables aren't created by migrations. The e2e setup creates this one with plain SQL:

```sql
create table <database>.userLoginLogs (datetime datetime not null, userId bigint unsigned not null) engine Log
```

## 2. Add the data module and entity

```typescript
// src/data/audit/audit.module.ts
@Module({})
export class DataAuditModule extends ClickHouseDBModule {
  static register(): DynamicModule {
    return ClickHouseDBModule.register({ folderData: FolderData, moduleClass: DataAuditModule, moduleName: 'audit' });
  }
}

// src/data/audit/entities/userLoginLogs/userLoginLogs.entity.ts
export const DataAuditUserLoginLogEntity: ClickHouseDBEntitySchema<DataAuditUserLoginLog> = {
  options: {
    columns: {
      datetime: { type: ClickHouseDBEntitySchemaColumnType.DateTime },
      userId: { type: ClickHouseDBEntitySchemaColumnType.BigInteger }
    },
    tableName: 'userLoginLogs',
    name: 'userLoginLog'
  }
};
```

Config: `data: { audit: { type: RDBType.ClickHouse } }`, with the connection details from the environment (`DATA_AUDIT_MODULE_TYPE=RDB`, `DATA_AUDIT_HOST`, ...). The entity module and service are in [Defining entities](../Data/entities.md#clickhouse).

## 3. Write a log entry

Inject the data service wherever the event happens - here, after a successful local login:

```typescript
async complete(data: CompleteData, options: CompleteOptions): Promise<CompleteResult> {
  const result = await super.complete(data, options);
  await this.userLoginLogsService.create({
    datetime: new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ''),
    userId: options.context.id
  });
  return result;
}
```

> [!WARNING]
> ClickHouse's `DateTime` doesn't accept ISO strings with a `T` and milliseconds - format the value as `YYYY-MM-DD hh:mm:ss`.

## 4. Read the logs over HTTP

A domain service and a controller, exactly as for any other entity - with only the routes ClickHouse supports enabled:

```typescript
super(domainEntityService, RESTAPIEntityController.getDefaultDtos<DataAuditUserLoginLog>(), logger, reflector, ['find']);
```

```bash
curl -g 'localhost:2070/userLoginLogs?filters[userId]=2&orderBy[datetime]=desc' -H "authorization: Bearer $TOKEN"
```

> [!TIP]
> The reference app adds a permission so that non-admin users can only read their own logs: `inputDataFieldName: 'query.filters.userId'`, `userFieldName: 'id'`. See [Adding a permission](./adding-a-permission.md).

---

Previous: [Caching with Redis](./caching.md) · Next: [Adding a permission](./adding-a-permission.md)
