import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RDBEntityService, SQLQueryBuilderService } from '@node-c/persistance-rdb';
import { Repository } from 'typeorm';

import { UserAccountStatus, UserAccountStatusEntity } from './userAccountStatuses.entity';

@Injectable()
export class UserAccountStatusesService extends RDBEntityService<UserAccountStatus> {
  constructor(
    qb: SQLQueryBuilderService,
    @InjectRepository(UserAccountStatusEntity)
    entity: Repository<UserAccountStatus>
  ) {
    super(qb, entity, UserAccountStatusEntity);
  }
}
