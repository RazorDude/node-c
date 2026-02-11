import { Module } from '@nestjs/common';

import { ClickHouseDBRepositoryModule } from '@node-c/data-clickhouse';

import { EntityAuditLogEntity } from './entityAuditLogs.entity';
import { AuditEntityAuditLogsService } from './entityAuditLogs.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    ClickHouseDBRepositoryModule.register({
      entitySchema: EntityAuditLogEntity,
      dataModuleName: Constants.PERSISTANCE_AUDIT_MODULE_NAME
    })
  ],
  providers: [AuditEntityAuditLogsService],
  exports: [AuditEntityAuditLogsService]
})
export class EntityAuditLogsModule {}
