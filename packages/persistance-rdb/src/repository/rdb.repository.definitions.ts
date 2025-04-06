import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export interface RDBRepositoryModuleOptions {
  connectionName: string;
  entityClass: EntityClassOrSchema;
  persistanceModuleName: string;
}
