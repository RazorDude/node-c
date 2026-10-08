import { Inject, Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { ConfigProviderService, LoggerService } from '@node-c/core';
import {
  ClickHouseDBEntityService,
  type ClickHouseDBRepository
} from '@node-c/data-clickhouse';
// biome-ignore lint/style/useImportType: DI.
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';

import {
  type DataAuditEntityAuditLog,
  DataAuditEntityAuditLogEntity
} from './entityAuditLogs.entity.js';

@Injectable()
export class DataAuditEntityAuditLogsService extends ClickHouseDBEntityService<DataAuditEntityAuditLog> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: ClickHouseDBRepository<DataAuditEntityAuditLog>
  ) {
    super(
      configProvider,
      logger,
      qb,
      repository,
      DataAuditEntityAuditLogEntity
    );
  }
}
