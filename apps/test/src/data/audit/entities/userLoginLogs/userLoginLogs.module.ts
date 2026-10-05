import { Module } from '@nestjs/common';

import { ClickHouseDBRepositoryModule } from '@node-c/data-clickhouse';

import { Constants } from '../../../../common/definitions/common.constants.js';

import { DataAuditUserLoginLogEntity } from './userLoginLogs.entity.js';
import { DataAuditUserLoginLogsService } from './userLoginLogs.service.js';

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
