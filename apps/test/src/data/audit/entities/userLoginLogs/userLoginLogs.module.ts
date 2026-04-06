import { Module } from '@nestjs/common';

import { ClickHouseDBRepositoryModule } from '@node-c/data-clickhouse';

import { DataAuditUserLoginLogEntity } from './userLoginLogs.entity';
import { DataAuditUserLoginLogsService } from './userLoginLogs.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    ClickHouseDBRepositoryModule.register({
      entitySchema: DataAuditUserLoginLogEntity,
      dataModuleName: Constants.DATA_AUDIT_MODULE_NAME
    })
  ],
  providers: [DataAuditUserLoginLogsService],
  exports: [DataAuditUserLoginLogsService]
})
export class DataAuditUserLoginLogsModule {}
