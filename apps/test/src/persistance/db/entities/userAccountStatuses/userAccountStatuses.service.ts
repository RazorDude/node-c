import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { Repository } from 'typeorm';

import { UserAccountStatus, UserAccountStatusEntity } from './userAccountStatuses.entity';

@Injectable()
export class UserAccountStatusesService extends RDBEntityService<UserAccountStatus> {
  constructor(
    @Inject(SQLQueryBuilderService)
    qb: SQLQueryBuilderService<UserAccountStatus>,
    @InjectRepository(UserAccountStatusEntity)
    entity: Repository<UserAccountStatus>
  ) {
    super(qb, entity);
  }
}
