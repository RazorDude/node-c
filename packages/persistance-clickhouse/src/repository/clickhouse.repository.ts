import { Inject, Injectable } from '@nestjs/common';

import { Constants } from '@node-c/persistance-rdb';

import { DataSource, EntityMetadata, EntitySchema, ObjectLiteral, Repository } from 'typeorm';

// TODO: dataSource
// TODO: entityManager
// TODO: queryBuilder
// TODO: save method
@Injectable()
export class ClickhouseRepository<Entity extends ObjectLiteral> implements Repository<Entity> {
  get metadata(): EntityMetadata {
      return {
        
      }
  }
  readonly hasId: () => boolean;
  readonly target: string;

  constructor(
    @Inject(Constants.RDB_REPOSITORY_DATASOURCE)
    protected dataSource: DataSource,
    @Inject(Constants.RDB_REPOSITORY_ENTITY_CLASS)
    protected entityClass: EntitySchema
  ) {
    // super(entityClass, dataSource.createEntityManager());
    this.hasId = () => false;
    this.target = entityClass.options.name;
  }
}
