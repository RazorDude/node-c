import { EntitySchemaColumnOptions } from 'typeorm';

export interface DBEntity {
  createdAt: Date;
  deletedAt?: Date;
  id: number;
  updatedAt: Date;
}

export class DBEntityClass implements DBEntity {
  createdAt: Date;
  deletedAt?: Date;
  id: number;
  updatedAt: Date;
}

export const DBEntitySchema: {
  columns: { [columnName: string]: EntitySchemaColumnOptions };
} = {
  columns: {
    createdAt: {
      // type: 'timestamp with time zone',
      type: 'datetime',
      createDate: true
    },
    deletedAt: {
      type: 'datetime',
      deleteDate: true
    },
    id: {
      type: 'integer',
      primary: true,
      generated: true
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true
    }
  }
};
