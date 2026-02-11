import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService } from '@node-c/core';
import { ClickHouseDBEntityService, ClickHouseDBRepository } from '@node-c/data-clickhouse';
import { Constants, SQLQueryBuilderService } from '@node-c/data-rdb';

import { EntityAuditLog, EntityAuditLogEntity } from './entityAuditLogs.entity';

@Injectable()
export class AuditEntityAuditLogsService extends ClickHouseDBEntityService<EntityAuditLog> {
  constructor(
    configProvider: ConfigProviderService,
    qb: SQLQueryBuilderService,
    @Inject(Constants.RDB_ENTITY_REPOSITORY)
    repository: ClickHouseDBRepository<EntityAuditLog>
  ) {
    super(configProvider, qb, repository, EntityAuditLogEntity);
  }
}
