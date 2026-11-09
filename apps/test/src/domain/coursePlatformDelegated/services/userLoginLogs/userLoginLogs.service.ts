import { Injectable } from '@nestjs/common';

import { DomainEntityService, LoggerService } from '@node-c/core';

import { DataAuditUserLoginLog } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.entity.js';
import { DataAuditUserLoginLogsService } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.service.js';

@Injectable()
export class DomainCoursePlatformDelegatedUserLoginLogsService extends DomainEntityService<
  DataAuditUserLoginLog,
  DataAuditUserLoginLogsService
> {
  constructor(
    dataEntityService: DataAuditUserLoginLogsService,
    logger: LoggerService
  ) {
    super(dataEntityService, undefined, logger);
  }
}
