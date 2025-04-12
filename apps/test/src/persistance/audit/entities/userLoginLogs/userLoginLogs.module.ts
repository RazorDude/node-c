import { Module } from '@nestjs/common';

import { ClickHouseDBRepositoryModule } from '@node-c/persistance-clickhouse';

import { UserLoginLogEntity } from './userLoginLogs.entity';
import { AuditUserLoginLogsService } from './userLoginLogs.service';

import { Constants } from '../../../../common/definitions';

@Module({
  imports: [
    ClickHouseDBRepositoryModule.register({
      entitySchema: UserLoginLogEntity,
      persistanceModuleName: Constants.PERSISTANCE_AUDIT_MODULE_NAME
    })
  ],
  providers: [AuditUserLoginLogsService],
  exports: [AuditUserLoginLogsService]
})
export class UserLoginLogsModule {}
