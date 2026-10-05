import { Inject, Injectable } from '@nestjs/common';

import type { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  ClickHouseDBEntityService,
  type ClickHouseDBRepository
} from '@node-c/data-clickhouse';
import { Constants, type SQLQueryBuilderService } from '@node-c/data-rdb';

import {
  type DataAuditUserLoginLog,
  DataAuditUserLoginLogEntity
} from './userLoginLogs.entity.js';

@Injectable()
export class DataAuditUserLoginLogsService extends ClickHouseDBEntityService<DataAuditUserLoginLog> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: ClickHouseDBRepository<DataAuditUserLoginLog>
  ) {
    super(configProvider, logger, qb, repository, DataAuditUserLoginLogEntity);
  }
}
