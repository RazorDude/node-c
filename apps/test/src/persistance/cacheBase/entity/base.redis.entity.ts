import { EntitySchema, EntitySchemaColumnType } from '@node-c/persistance-redis';

export interface RedisEntity<Id> {
  createdAt: Date;
  deletedAt?: Date;
  id: Id;
  updatedAt: Date;
}

// TODO: validate this somehow; class-validator?
export const getDefaultEntitySchema = (
  idColumn: EntitySchemaColumnType,
  name: string,
  storeKey?: string
): EntitySchema => {
  return {
    columns: {
      createdAt: {
        isCreationDate: true,
        type: EntitySchemaColumnType.TimestampTz
      },
      deletedAt: {
        isDeletionDate: true,
        type: EntitySchemaColumnType.TimestampTz
      },
      id: {
        generated: true,
        primary: true,
        primaryOrder: 0,
        type: idColumn
      },
      updatedAt: {
        isUpdateDate: true,
        type: EntitySchemaColumnType.TimestampTz
      }
    },
    name,
    storeKey: storeKey || name
  };
};
