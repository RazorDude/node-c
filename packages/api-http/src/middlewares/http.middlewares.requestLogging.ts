import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { LoggerService } from '@node-c/core';

import type { NextFunction, Response } from 'express';

import { Constants } from '../common/definitions/common.constants.js';
import type { RequestWithLocals } from '../common/definitions/common.definitions.js';

@Injectable()
export class HTTPRequestLoggingMiddleware implements NestMiddleware {
  constructor(
    protected logger: LoggerService,
    @Inject(Constants.API_MODULE_NAME)
    protected moduleName: string
  ) {}

  use(
    req: RequestWithLocals<unknown>,
    _res: Response,
    next: NextFunction
  ): void {
    this.logger.info(`[${this.moduleName}]: ${req.method} ${req.baseUrl}`);
    next();
  }
}
