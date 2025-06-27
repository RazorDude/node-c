export interface RDBEntitySchema {
  options: {
    columns: {
      [columnName: string]: { deleteDate?: boolean; primary?: boolean } | undefined;
    };
  };
}
