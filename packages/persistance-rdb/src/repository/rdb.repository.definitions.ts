import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export interface RDBRepositoryModuleOptions {
  entityClass: EntityClassOrSchema;
  persistanceModuleName: string;
}
