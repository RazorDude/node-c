import { Inject, Injectable } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { Constants } from '@node-c/data-rdb';

import { DataSource, ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export class TypeORMDBRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
  constructor(
    @Inject(Constants.RDB_REPOSITORY_DATASOURCE)
    protected dataSource: DataSource,
    @Inject(Constants.RDB_REPOSITORY_ENTITY_CLASS)
    protected entityClass: EntityClassOrSchema
  ) {
    super(entityClass, dataSource.createEntityManager());
  }
}
