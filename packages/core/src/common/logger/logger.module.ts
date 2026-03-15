import { DynamicModule, Module } from '@nestjs/common';

import ld from 'lodash';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { LoggerModuleOptions } from './logger.definitions';
import { DEFAULT_PINO_PARAMS, LoggerService } from './logger.service';

@Module({})
export class LoggerModule {
  static register(options?: LoggerModuleOptions): DynamicModule {
    const { pinoParams } = options || {};
    return {
      global: true,
      module: LoggerModule,
      imports: [PinoLoggerModule.forRoot(ld.merge(DEFAULT_PINO_PARAMS, pinoParams || {}))],
      providers: [LoggerService],
      exports: [LoggerService]
    };
  }
}
