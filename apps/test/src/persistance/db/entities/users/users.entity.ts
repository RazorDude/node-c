import { EntitySchema, EntitySchemaRelationOptions } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { AccessControlPoint } from '../accessControlPoints';
import { Course } from '../courses';
import { UserAccountStatus } from '../userAccountStatuses';
import { UserType } from '../userTypes';

export interface User extends DBEntity {
  accountStatus?: UserAccountStatus;
  accountStatusId: number;
  assignedCourses?: Course[];
  assignedUserTypes?: UserType[];
  currentAccessControlPoints?: { [accessControlPointId: string]: AccessControlPoint };
  email: string;
  firstName: string;
  hasTakenIntro: boolean;
  isVerified: boolean;
  lastName: string;
  mfaIsEnabled: boolean;
  password?: string;
  phoneNumber: string;
  profileImageKey?: string;
  profileImageUrl?: string;
}

export const UserEntity = new EntitySchema<User>({
  columns: {
    ...DBEntitySchema.columns,
    accountStatusId: { type: 'integer' },
    email: { type: 'varchar' },
    firstName: { type: 'varchar' },
    hasTakenIntro: { type: 'boolean', default: false },
    isVerified: { type: 'boolean', default: false },
    lastName: { type: 'varchar' },
    mfaIsEnabled: { type: 'boolean', default: false },
    // TODO: fix this!!!
    password: { type: 'varchar', nullable: true /*, select: false*/ },
    phoneNumber: { type: 'varchar', nullable: true },
    profileImageKey: { type: 'varchar', nullable: true }
  },
  indices: [
    {
      name: 'USERS_UNIQUE_IDX_0',
      unique: true,
      columns: ['email'],
      where: '"deletedAt" IS NULL'
    }
  ],
  name: 'user',
  relations: {
    accountStatus: {
      type: 'many-to-one',
      target: 'userAccountStatus',
      inverseSide: 'users'
    } as EntitySchemaRelationOptions,
    assignedCourses: {
      type: 'many-to-many',
      target: 'course',
      inverseSide: 'users'
    } as EntitySchemaRelationOptions,
    assignedUserTypes: {
      type: 'many-to-many',
      target: 'userType',
      inverseSide: 'assignedUsers'
    } as EntitySchemaRelationOptions
  },
  tableName: 'users'
});
