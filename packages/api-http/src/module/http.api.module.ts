import { DynamicModule, Inject, MiddlewareConsumer, ModuleMetadata, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { ConfigProviderService, loadDynamicModules } from '@node-c/core';

import cookieParser from 'cookie-parser';
import express, { Response } from 'express';
import morgan from 'morgan';

import { HTTPAPIModuleOptions } from './http.api.module.definitions';

import { Constants, RequestWithLocals } from '../common/definitions';
import { HttpExceptionFilter } from '../exceptionFilters';
import { HTTPAuthorizationInterceptor, HTTPErrorInterceptor } from '../interceptors';
import { HTTPAuthenticationMiddleware, HTTPCORSMiddleware } from '../middlewares';

export class HTTPAPIModule {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(express.urlencoded({ verify: HTTPAPIModule.rawBodyBuffer, extended: true })).forRoutes('*');
    consumer.apply(express.json({ verify: HTTPAPIModule.rawBodyBuffer })).forRoutes('*');
    consumer.apply(cookieParser()).forRoutes('*');
    // configure logging
    consumer.apply(morgan(`[${this.moduleName}]: :method :url :status :res[content-length] - :response-time ms`));
    consumer.apply(HTTPCORSMiddleware).forRoutes('*');
    consumer.apply(HTTPAuthenticationMiddleware).forRoutes('*');
  }

  static rawBodyBuffer(req: RequestWithLocals<unknown>, _res: Response, buffer: Buffer): void {
    if (buffer && buffer.length) {
      req.rawBody = buffer.toString();
    }
  }

  static register(options: HTTPAPIModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass } = options;
    const { atEnd: importsAtEnd, atStart: importsAtStart } = additionalImports || {};
    const { controllers, services } = loadDynamicModules(folderData);
    return {
      module: moduleClass as DynamicModule['module'],
      imports: [...(importsAtStart || []), ...(importsAtEnd || [])],
      providers: [
        // configure DTO validation
        {
          provide: APP_PIPE,
          // useClass: ValidationPipe
          useValue: new ValidationPipe({
            whitelist: true
          })
        },
        {
          provide: Constants.API_MODULE_NAME,
          useValue: options.moduleName
        },
        {
          provide: Constants.AUTHORIZATION_INTERCEPTOR,
          useClass: HTTPAuthorizationInterceptor
        },
        {
          provide: Constants.ERROR_INTERCEPTOR,
          useClass: HTTPErrorInterceptor
        },
        {
          provide: Constants.HTTP_EXCEPTION_FILTER,
          useClass: HttpExceptionFilter
        },
        ...(options.providers || []),
        ...(services || [])
      ],
      controllers: [...(controllers || []), ...(options.controllers || [])] as unknown as ModuleMetadata['controllers'],
      exports: [...(services || []), ...(options.exports || [])]
    };
  }
}
