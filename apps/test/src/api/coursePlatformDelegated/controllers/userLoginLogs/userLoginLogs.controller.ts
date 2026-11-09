import { Controller, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessControlContext } from '@node-c/api-http';
import { RESTAPIEntityController } from '@node-c/api-rest';
import { LoggerService } from '@node-c/core';

import { DataAuditUserLoginLog } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.entity.js';
import { DomainCoursePlatformDelegatedUserLoginLogsService } from '../../../../domain/coursePlatformDelegated/services/userLoginLogs/userLoginLogs.service.js';

@AccessControlContext('CoursePlatformUserLoginLogsEntityController')
@Injectable()
@Controller('userLoginLogs')
export class APICoursePlatformDelegatedUserLoginLogsEntityController extends RESTAPIEntityController<
  DataAuditUserLoginLog,
  DomainCoursePlatformDelegatedUserLoginLogsService
> {
  constructor(
    domainEntityService: DomainCoursePlatformDelegatedUserLoginLogsService,
    logger: LoggerService,
    reflector: Reflector
  ) {
    super(
      domainEntityService,
      RESTAPIEntityController.getDefaultDtos<DataAuditUserLoginLog>(),
      logger,
      reflector,
      ['delete', 'find']
    );
  }
}
