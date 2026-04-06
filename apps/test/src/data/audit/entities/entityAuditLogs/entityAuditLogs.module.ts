import { Module } from '@nestjs/common';

import { ClickHouseDBRepositoryModule } from '@node-c/data-clickhouse';

import { DataAuditEntityAuditLogEntity } from './entityAuditLogs.entity';
import { DataAuditEntityAuditLogsService } from './entityAuditLogs.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    ClickHouseDBRepositoryModule.register({
      entitySchema: DataAuditEntityAuditLogEntity,
      dataModuleName: Constants.DATA_AUDIT_MODULE_NAME
    })
  ],
  providers: [DataAuditEntityAuditLogsService],
  exports: [DataAuditEntityAuditLogsService]
})
export class DataAuditEntityAuditLogsModule {}
