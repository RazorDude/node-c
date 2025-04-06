import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export interface ClickhouseRepositoryModuleOptions {
  connectionName: string;
  entityClass: EntityClassOrSchema;
  persistanceModuleName: string;
}
