import { Inject, Injectable } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DataSource, ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export class RDBRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
  constructor(
    @Inject('RDB_REPOSITORY_ENTITY_CLASS')
    protected entityClass: EntityClassOrSchema,
    // eslint-disable-next-line prettier/prettier
    protected dataSource: DataSource
  ) {
    super(entityClass, dataSource.createEntityManager());
  }
}
