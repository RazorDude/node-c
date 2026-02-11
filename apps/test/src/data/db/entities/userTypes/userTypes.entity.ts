import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { AuthorizationPoint } from '../authorizationPoints';

export interface UserType<User extends DBEntity = DBEntity> extends DBEntity {
  authorizationPoints?: AuthorizationPoint[];
  assignedUsers?: User[];
  isActive: boolean;
  isEditable: boolean;
  name: string;
}

export const UserTypeEntity = new EntitySchema<UserType>({
  columns: {
    ...DBEntitySchema.columns,
    isActive: { type: 'boolean', default: true },
    isEditable: { type: 'boolean', default: true },
    name: { type: 'varchar', unique: true }
  },
  name: 'userType',
  relations: {
    authorizationPoints: {
      type: 'many-to-many',
      target: 'authorizationPoint',
      inverseSide: 'userTypes',
      joinTable: {
        name: 'userTypeAuthorizationPoints',
        joinColumn: { name: 'userTypeId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'authorizationPointId', referencedColumnName: 'id' }
      }
    } as EntitySchemaRelationOptions,
    assignedUsers: {
      type: 'many-to-many',
      target: 'user',
      inverseSide: 'assignedUserTypes',
      joinTable: {
        name: 'userTypeAssignedUsers',
        joinColumn: { name: 'userTypeId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
      }
    } as EntitySchemaRelationOptions
  },
  tableName: 'userTypes'
});
