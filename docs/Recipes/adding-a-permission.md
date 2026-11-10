# Adding a Permission

Give a role access to a route - and, optionally, limit what it may ask for and see. This recipe adds the reference app's `NonAdminFindNonFreeCourses` permission: non-admin users may list courses, but only the ones assigned to them. For how permissions are evaluated, see [Access Control](../Security/access-control.md).

## 1. Find the names the permission must use

| Field | Comes from | Here |
|---|---|---|
| `moduleName` | the API module's `ACCESS_CONTROL_MODULE_NAME` provider | `coursePlatform` |
| `resourceContext` | the controller's `@AccessControlContext('...')`, or its class name | `CoursePlatformCoursesEntityController` |
| `resources` | the handler names (`find`, `findOne`, `create`, ...) | `["find"]` |

> [!WARNING]
> `find` and `findOne` are different resources - a permission for one doesn't cover the other.

## 2. Decide the fine-grained rules

"Only the courses assigned to the user" means: the request's `query.filters.id` must be one of the user's `assignedCourses.id` - and if the request has no id filter, it gets one with the user's course ids.

```json
{
  "inputDataFieldName": "query.filters.id",
  "userFieldName": "assignedCourses.id",
  "allowedInputData": { "query.include": ["/^lessons(\\.lessonType)?$/", "courseType"] }
}
```

`allowedInputData` additionally limits which relations the user may include.

> [!WARNING]
> `userFieldName` reads from the user object built at login, so the relation must be loaded there - the reference app's users service adds `assignedCourses` to the `include` of `getUserWithPermissionsData`.

## 3. Add it in a seed

```typescript
export class NonFreeCoursesPermission1780000000000 implements MigrationInterface {
  name = 'NonFreeCoursesPermission1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'INSERT INTO `permissions` (`id`, `allowedInputData`, `inputDataFieldName`, `moduleName`, `name`, `resourceContext`, `resources`, `userFieldName`) VALUES ' +
        '(?, ?, ?, ?, ?, ?, ?, ?);',
      [
        3,
        '{ "query.include": ["/^lessons(\\\\.lessonType)?$/", "courseType"] }',
        'query.filters.id',
        'coursePlatform',
        'NonAdminFindNonFreeCourses',
        'CoursePlatformCoursesEntityController',
        '["find"]',
        'assignedCourses.id'
      ]
    );
    await queryRunner.query('INSERT INTO `rolePermissions` (`roleId`, `permissionId`) VALUES (2, 3);');
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
```

See [Seeding data](./seeding-data.md) for where the file goes and how it runs.

> [!TIP]
> The id matters: permissions are checked in ascending id order, and the first one that passes wins. The reference app's free-courses permission (id 1) is checked first; this one is only reached when that one fails.

## 4. Check it

1. Rebuild and run the migrations, then **log in again** - the user's permissions are read at login.
2. As a non-admin user, `GET /courses` returns only the assigned courses, and `GET /courses?filters[id]=<an unassigned id>` returns a 403.
3. A 403 logs which check failed: `No user access to resource coursePlatform.CoursePlatformCoursesEntityController.find - FGA_NO_ACCESS.`

---

Previous: [Audit logs with ClickHouse](./audit-logs.md) · Next: [Seeding data](./seeding-data.md)
