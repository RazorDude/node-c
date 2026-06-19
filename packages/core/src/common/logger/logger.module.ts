import { DynamicModule, Module } from '@nestjs/common';

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
      imports: [PinoLoggerModule.forRoot(pinoParams || DEFAULT_PINO_PARAMS)],
      providers: [LoggerService],
      exports: [LoggerService]
    };
  }
}
