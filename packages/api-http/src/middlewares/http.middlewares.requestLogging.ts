import { Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { LoggerService } from '@node-c/core';
import { NextFunction, Response } from 'express';

import { Constants } from '../common/definitions/common.constants.js';
import { RequestWithLocals } from '../common/definitions/common.definitions.js';

@Injectable()
export class HTTPRequestLoggingMiddleware implements NestMiddleware {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  use(req: RequestWithLocals<unknown>, _res: Response, next: NextFunction): void {
    this.logger.info(`[${this.moduleName}]: ${req.method} ${req.baseUrl}`);
    next();
  }
}
