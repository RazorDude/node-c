export type RDBEntityRelationType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export interface RDBEntitySchema {
  options: {
    columns: {
      [columnName: string]: { deleteDate?: boolean; name?: string; primary?: boolean } | undefined;
    };
    relations?: {
      [relationName: string]:
        | {
            target: string | unknown;
            type: RDBEntityRelationType;
          }
        | undefined;
    };
  };
}
