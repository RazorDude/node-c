import path from 'path';

import { Inject, Injectable } from '@nestjs/common';

import { Logger, PARAMS_PROVIDER_TOKEN, Params, PinoLogger } from 'nestjs-pino';
import { v4 as uuid } from 'uuid';

export const DEFAULT_PINO_PARAMS: Params = {
  pinoHttp: {
    // autoLogging: false,
    genReqId: () => uuid(),
    quietReqLogger: true,
    quietResLogger: true,
    transport: {
      targets: [
        {
          options: { destination: path.resolve(process.cwd(), 'logs/app_logs.txt'), sync: false },
          target: 'pino/file'
        },
        {
          // level: 'info',
          options: { destination: 1, sync: false },
          target: 'pino-pretty'
        }
      ]
    }
  }
};

@Injectable()
export class LoggerService extends Logger {
  constructor(logger: PinoLogger, @Inject(PARAMS_PROVIDER_TOKEN) params: Params) {
    super(logger, params);
  }

  info(...args: unknown[]): void {
    // eslint-disable-next-line prefer-spread
    this.logger.info.apply(this, args as [unknown, string, ...unknown[]]);
  }
}
