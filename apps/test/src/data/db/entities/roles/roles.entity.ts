import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { DataDBPermission } from '../permissions';

export interface DataDBRole<User extends DBEntity = DBEntity> extends DBEntity {
  permissions?: DataDBPermission[];
  assignedUsers?: User[];
  isActive: boolean;
  isEditable: boolean;
  name: string;
}

export const DataDBRoleEntity = new EntitySchema<DataDBRole>({
  columns: {
    ...DBEntitySchema.columns,
    isActive: { type: 'boolean', default: true },
    isEditable: { type: 'boolean', default: true },
    name: { type: 'varchar', unique: true }
  },
  name: 'role',
  relations: {
    permissions: {
      type: 'many-to-many',
      target: 'permission',
      inverseSide: 'roles',
      joinTable: {
        name: 'rolePermissions',
        joinColumn: { name: 'roleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' }
      }
    } as EntitySchemaRelationOptions,
    assignedUsers: {
      type: 'many-to-many',
      target: 'user',
      inverseSide: 'assignedRoles',
      joinTable: {
        name: 'userAssignedRoles',
        joinColumn: { name: 'roleId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
      }
    } as EntitySchemaRelationOptions
  },
  tableName: 'roles'
});
