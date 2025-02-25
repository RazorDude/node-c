import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { Repository } from 'typeorm';

import { UserType, UserTypeEntity } from './userTypes.entity';

@Injectable()
export class UserTypesService extends RDBEntityService<UserType> {
  constructor(
    @Inject(SQLQueryBuilderService)
    qb: SQLQueryBuilderService<UserType>,
    @InjectRepository(UserTypeEntity)
    entity: Repository<UserType>
  ) {
    super(qb, entity);
  }
}
