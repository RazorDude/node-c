export interface RDBEntitySchema {
  options: {
    columns: {
      [columnName: string]: { primary?: boolean } | undefined;
    };
  };
}
