import { NextFunction, Response } from 'express';

import { RequestWithLocals } from '../../common/definitions';

type MiddlewareFunction = (_req: RequestWithLocals<unknown>, _res: Response, _next: NextFunction) => void;

export function getCORSMiddleware(allowedOrigins?: string[]): MiddlewareFunction {
  return (req: RequestWithLocals<unknown>, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string;
    if (allowedOrigins!.includes(origin)) {
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
      res.status(200).end();
      return;
    }
    next();
  };
}
