import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, LoggerService } from '@node-c/core';
import { ClickHouseDBEntityService, ClickHouseDBRepository } from '@node-c/data-clickhouse';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';

import { DataAuditEntityAuditLog, DataAuditEntityAuditLogEntity } from './entityAuditLogs.entity';

@Injectable()
export class DataAuditEntityAuditLogsService extends ClickHouseDBEntityService<DataAuditEntityAuditLog> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: ClickHouseDBRepository<DataAuditEntityAuditLog>
  ) {
    super(configProvider, logger, qb, repository, DataAuditEntityAuditLogEntity);
  }
}
