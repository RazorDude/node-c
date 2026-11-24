import path from 'node:path';
import { cwd } from 'node:process';

import { Inject, Injectable } from '@nestjs/common';
import * as NestjsPino from '@node-c/nestjs-pino';

import { v4 as uuid } from 'uuid';

// satisfies instead of a type annotation, so that pinoHttp keeps its object type and can be spread
export const DEFAULT_PINO_PARAMS = {
  pinoHttp: {
    // autoLogging: false,
    genReqId: (): string => uuid(),
    quietReqLogger: true,
    quietResLogger: true,
    transport: {
      targets: [
        {
          options: {
            destination: path.resolve(cwd(), 'logs/app_logs.txt'),
            mkdir: true,
            sync: false
          },
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
} satisfies NestjsPino.Params;

@Injectable()
export class LoggerService extends NestjsPino.Logger {
  constructor(
    logger: NestjsPino.PinoLogger,
    @Inject(NestjsPino.PARAMS_PROVIDER_TOKEN) params: NestjsPino.Params
  ) {
    super(logger, params);
  }

  info(...args: unknown[]): void {
    this.logger.info.apply(this, args as [unknown, string, ...unknown[]]);
  }
}
