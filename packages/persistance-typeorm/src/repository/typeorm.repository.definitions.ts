import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export interface TypeORMRepositoryModuleOptions {
  connectionName: string;
  entityClass: EntityClassOrSchema;
  persistanceModuleName: string;
}
