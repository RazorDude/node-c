import { EntitySchema } from 'typeorm';

export interface TypeORMDBRepositoryModuleOptions {
  connectionName: string;
  entityClass: EntitySchema<unknown>;
  dataModuleName: string;
}
