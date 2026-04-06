import { IAMPermission as BaseIAMPermission } from '@node-c/domain-iam';

import { EntitySchema } from 'typeorm';

import { DBEntity, DBEntitySchema } from '../../../dbBase';
import { DataDBCourse } from '../courses';
import { DataDBRole } from '../roles';
import { DataDBUserAccountStatus } from '../userAccountStatuses';

export interface DataDBUser extends DBEntity {
  accountStatus?: DataDBUserAccountStatus;
  accountStatusId: number;
  assignedCourses?: DataDBCourse[];
  assignedRoles?: DataDBRole[];
  currentPermissions?: { [permissionId: string]: BaseIAMPermission<number> };
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

export const DataDBUserEntity = new EntitySchema<DataDBUser>({
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
    },
    assignedCourses: {
      type: 'many-to-many',
      target: 'course',
      inverseSide: 'users'
    },
    assignedRoles: {
      type: 'many-to-many',
      target: 'role',
      inverseSide: 'assignedUsers'
    }
  },
  tableName: 'users'
});
