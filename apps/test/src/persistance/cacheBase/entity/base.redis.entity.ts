import { EntitySchema, EntitySchemaColumnType } from '@node-c/persistance-redis';

export interface RedisEntity<Id> {
  createdAt: Date;
  deletedAt?: Date;
  id: Id;
  updatedAt: Date;
}

// TODO: validate this somehow; class-validator?
export const getDefaultEntitySchema = (idColumn: EntitySchemaColumnType, name: string): EntitySchema => {
  return {
    columns: {
      createdAt: {
        type: EntitySchemaColumnType.TimestampTz,
        isCreationDate: true
      },
      deletedAt: {
        type: EntitySchemaColumnType.TimestampTz,
        isDeletionDate: true
      },
      id: {
        type: idColumn,
        primary: true
      },
      updatedAt: {
        type: EntitySchemaColumnType.TimestampTz,
        isUpdateDate: true
      }
    },
    name
  };
};
