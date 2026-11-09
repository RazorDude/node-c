import { Controller, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import * as NodeCApiHttp from '@node-c/api-http';
import { RESTAPIEntityController } from '@node-c/api-rest';
import { LoggerService } from '@node-c/core';

import { DataAuditUserLoginLog } from '../../../../data/audit/entities/userLoginLogs/userLoginLogs.entity.js';
import { DomainCoursePlatformStandaloneUserLoginLogsService } from '../../../../domain/coursePlatformStandalone/services/userLoginLogs/userLoginLogs.service.js';

@NodeCApiHttp.AccessControlContext(
  'CoursePlatformUserLoginLogsEntityController'
)
@Injectable()
@Controller('userLoginLogs')
export class APICoursePlatformStandaloneUserLoginLogsEntityController extends RESTAPIEntityController<
  DataAuditUserLoginLog,
  DomainCoursePlatformStandaloneUserLoginLogsService
> {
  constructor(
    domainEntityService: DomainCoursePlatformStandaloneUserLoginLogsService,
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
