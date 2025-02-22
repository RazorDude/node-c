import { describe, expect, it } from 'vitest';

import { getDefaultEntitySchema } from './index';

import { EntitySchemaColumnType } from '../repository';

describe('getDefaultEntitySchema', () => {
  it('returns default schema with UUIDV4 for id column', () => {
    const schema = getDefaultEntitySchema(EntitySchemaColumnType.UUIDV4, 'TestEntityUUID');
    expect(schema).toEqual({
      name: 'TestEntityUUID',
      columns: {
        createdAt: { type: EntitySchemaColumnType.TimestampTz, isCreationDate: true },
        deletedAt: { type: EntitySchemaColumnType.TimestampTz, isDeletionDate: true },
        id: { type: EntitySchemaColumnType.UUIDV4, isCreationDate: true },
        updatedAt: { type: EntitySchemaColumnType.TimestampTz, isUpdateDate: true }
      }
    });
  });
  it('returns default schema with Integer for id column', () => {
    const schema = getDefaultEntitySchema(EntitySchemaColumnType.Integer, 'TestEntityInteger');
    expect(schema).toEqual({
      name: 'TestEntityInteger',
      columns: {
        createdAt: { type: EntitySchemaColumnType.TimestampTz, isCreationDate: true },
        deletedAt: { type: EntitySchemaColumnType.TimestampTz, isDeletionDate: true },
        id: { type: EntitySchemaColumnType.Integer, isCreationDate: true },
        updatedAt: { type: EntitySchemaColumnType.TimestampTz, isUpdateDate: true }
      }
    });
  });
});
