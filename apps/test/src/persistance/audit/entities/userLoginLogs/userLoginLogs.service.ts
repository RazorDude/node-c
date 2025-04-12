import { Inject, Injectable } from '@nestjs/common';

import { ClickHouseDBEntityService, ClickHouseDBRepository } from '@node-c/persistance-clickhouse';
import { Constants, SQLQueryBuilderService } from '@node-c/persistance-rdb';

import { UserLoginLog, UserLoginLogEntity } from './userLoginLogs.entity';

@Injectable()
export class AuditUserLoginLogsService extends ClickHouseDBEntityService<UserLoginLog> {
  constructor(
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: ClickHouseDBRepository<UserLoginLog>
  ) {
    super(qb, repository, UserLoginLogEntity);
  }
}
