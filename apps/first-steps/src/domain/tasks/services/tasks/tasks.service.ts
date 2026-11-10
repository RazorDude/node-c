import { Injectable } from '@nestjs/common';

import { DomainEntityService, LoggerService } from '@node-c/core';

import { DataDBTask } from '../../../../data/db/entities/tasks/tasks.entity.js';
import { DataDBTasksService } from '../../../../data/db/entities/tasks/tasks.service.js';

@Injectable()
export class DomainTasksService extends DomainEntityService<
  DataDBTask,
  DataDBTasksService
> {
  constructor(dataEntityService: DataDBTasksService, logger: LoggerService) {
    super(dataEntityService, undefined, logger);
  }
}
