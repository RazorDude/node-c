import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Response } from 'express';

import { Constants, RequestWithLocals } from '../common/definitions';

@Injectable()
export class HTTPCORSMiddleware implements NestMiddleware {
  constructor(
    @Inject(Constants.API_MODULE_ALLOWED_ORIGINS)
    // eslint-disable-next-line no-unused-vars
    protected allowedOrigins?: string[]
  ) {}

  use(req: RequestWithLocals<unknown>, res: Response, next: NextFunction): void {
    const origin = req.headers.origin as string;
    if (this.allowedOrigins?.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    res.set(
      'Access-Control-Allow-Headers',
      'accept,accept-encoding,accept-language,authorization,connection,content-type,host,origin,referer,user-agent'
    );
    res.set('Access-Control-Expose-Headers', 'Authorization');
    res.set('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
    res.set('Access-Control-Allow-Credentials', 'true');
    if (req.method.toLowerCase() === 'options') {
      res.status(HttpStatus.OK).end();
      return;
    }
    next();
  }
}
