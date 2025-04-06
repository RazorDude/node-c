import { Inject, Injectable } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DataSource, ObjectLiteral, Repository } from 'typeorm';

import { Constants } from '../common/definitions';

@Injectable()
export class RDBRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
  constructor(
    @Inject(Constants.RDB_REPOSITORY_DATASOURCE)
    // eslint-disable-next-line prettier/prettier
    protected dataSource: DataSource,
    @Inject(Constants.RDB_REPOSITORY_ENTITY_CLASS)
    protected entityClass: EntityClassOrSchema
  ) {
    super(entityClass, dataSource.createEntityManager());
  }
}
