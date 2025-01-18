import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Response } from 'express';

import { RequestWithLocals } from '../../../common/definitions';

@Injectable()
export class HTTPAnonymousRoutesMiddleware implements NestMiddleware {
  constructor() {}

  use(req: RequestWithLocals<unknown>, _res: Response, next: NextFunction): void {
    if (!req.locals) {
      req.locals = {};
    }
    req.locals.isAnonymous = true;
    next();
  }
}
