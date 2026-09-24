import { DynamicModule, Module } from '@nestjs/common';

import { LoggerModule as PinoLoggerModule } from '@node-c/nestjs-pino';

import { LoggerModuleOptions } from './logger.definitions.js';
import { DEFAULT_PINO_PARAMS, LoggerService } from './logger.service.js';

@Module({})
export class LoggerModule {
  static register(options?: LoggerModuleOptions): DynamicModule {
    const { pinoParams } = options || {};
    return {
      global: true,
      module: LoggerModule,
      imports: [PinoLoggerModule.forRoot(pinoParams || DEFAULT_PINO_PARAMS)],
      providers: [LoggerService],
      exports: [LoggerService]
    };
  }
}
