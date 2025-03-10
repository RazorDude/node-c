import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { AccessControlPoint } from '../accessControlPoints';

export interface UserType<User extends DBEntity = DBEntity> extends DBEntity {
  accessControlPoints?: AccessControlPoint[];
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
    accessControlPoints: {
      type: 'many-to-many',
      target: 'accessControlPoint',
      inverseSide: 'userTypes',
      joinTable: {
        name: 'userTypeAccessControlPoints',
        joinColumn: { name: 'userTypeId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'accessControlPointId', referencedColumnName: 'id' }
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
