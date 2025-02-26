import { EntitySchemaColumnOptions } from 'typeorm';

export interface RDBEntity {
  createdAt: Date;
  deletedAt?: Date;
  id: number;
  updatedAt: Date;
}

export class RDBEntityClass implements RDBEntity {
  createdAt: Date;
  deletedAt?: Date;
  id: number;
  updatedAt: Date;
}

export const RDBEntitySchema: {
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
