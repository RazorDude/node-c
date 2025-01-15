export interface RedisEntity {
  createdAt: Date;
  deletedAt?: Date;
  id: number;
  updatedAt: Date;
}

// TODO: validate this somehow; class-validator?
export const RedisEntitySchema: {
  columns: { [columnName: string]: Record<string, unknown> };
} = {
  columns: {
    createdAt: {
      type: 'timestamp with time zone',
      createDate: true
    },
    deletedAt: {
      type: 'timestamp with time zone',
      deleteDate: true
    },
    id: {
      type: 'integer',
      primary: true,
      generated: true
    },
    updatedAt: {
      type: 'timestamp with time zone',
      updateDate: true
    }
  }
};
