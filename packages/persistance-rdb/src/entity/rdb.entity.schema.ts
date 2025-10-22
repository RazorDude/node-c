export interface RDBEntitySchema {
  options: {
    columns: {
      [columnName: string]: { deleteDate?: boolean; name?: string; primary?: boolean } | undefined;
    };
  };
}
