import { Module } from '@nestjs/common';

import { ClickHouseDBRepositoryModule } from '@node-c/data-clickhouse';

import { UserLoginLogEntity } from './userLoginLogs.entity';
import { AuditUserLoginLogsService } from './userLoginLogs.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    ClickHouseDBRepositoryModule.register({
      entitySchema: UserLoginLogEntity,
      dataModuleName: Constants.DATA_AUDIT_MODULE_NAME
    })
  ],
  providers: [AuditUserLoginLogsService],
  exports: [AuditUserLoginLogsService]
})
export class UserLoginLogsModule {}
