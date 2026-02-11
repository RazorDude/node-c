import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { ClickHouseDBEntityService, ClickHouseDBRepository } from '@node-c/data-clickhouse';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';

import { UserLoginLog, UserLoginLogEntity } from './userLoginLogs.entity';

@Injectable()
export class AuditUserLoginLogsService extends ClickHouseDBEntityService<UserLoginLog> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: ClickHouseDBRepository<UserLoginLog>
  ) {
    super(configProvider, qb, repository, UserLoginLogEntity);
  }
}
