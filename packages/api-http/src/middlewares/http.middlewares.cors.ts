import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { AppConfigAPIHTTP, ConfigProviderService } from '@node-c/core';
import { NextFunction, Response } from 'express';

import { Constants, RequestWithLocals } from '../common/definitions';

@Injectable()
export class HTTPCORSMiddleware implements NestMiddleware {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  use(req: RequestWithLocals<unknown>, res: Response, next: NextFunction): void {
    const allowedOrigins = (this.configProvider.config.api![this.moduleName] as AppConfigAPIHTTP).allowedOrigins;
    const origin = req.headers.origin as string;
    if (allowedOrigins?.includes(origin)) {
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
