import { Controller, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RESTAPIEntityController } from '@node-c/api-rest';
import { LoggerService } from '@node-c/core';

import { DataDBTask } from '../../../../data/db/entities/tasks/tasks.entity.js';
import { DomainTasksService } from '../../../../domain/tasks/services/tasks/tasks.service.js';

@Injectable()
@Controller('tasks')
export class APITasksEntityController extends RESTAPIEntityController<
  DataDBTask,
  DomainTasksService
> {
  constructor(
    domainEntityService: DomainTasksService,
    logger: LoggerService,
    reflector: Reflector
  ) {
    super(
      domainEntityService,
      RESTAPIEntityController.getDefaultDtos<DataDBTask>(),
      logger,
      reflector
    );
  }
}
