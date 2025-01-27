import { DynamicModule, Inject, MiddlewareConsumer } from '@nestjs/common';

import cookieParser from 'cookie-parser';
import express, { Response } from 'express';

import { HTTPAPIModuleOptions } from './http.api.module.definitions';

import { AppConfigAPIHTTP, ConfigProviderService } from '../../../common/configProvider';
import { Constants, RequestWithLocals } from '../../../common/definitions';
import { loadDynamicModules } from '../../../common/utils';
import { HttpExceptionFilter } from '../exceptionFilters';
import { HTTPAuthorizationInterceptor, HTTPErrorInterceptor } from '../interceptors';
import { HTTPAnonymousRoutesMiddleware, HTTPAuthenticationMiddleware, HTTPCORSMiddleware } from '../middlewares';

export class HTTPAPIModule {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    const { anonymousAccessRoutes } = this.configProvider.config.api![this.moduleName] as AppConfigAPIHTTP;
    consumer.apply(express.urlencoded({ verify: HTTPAPIModule.rawBodyBuffer, extended: true })).forRoutes('*');
    consumer.apply(express.json({ verify: HTTPAPIModule.rawBodyBuffer })).forRoutes('*');
    consumer.apply(cookieParser()).forRoutes('*');
    consumer.apply(HTTPCORSMiddleware).forRoutes('*');
    if (anonymousAccessRoutes && anonymousAccessRoutes.length) {
      consumer.apply(HTTPAnonymousRoutesMiddleware).forRoutes(...anonymousAccessRoutes);
      consumer
        .apply(HTTPAuthenticationMiddleware)
        .exclude(...anonymousAccessRoutes)
        .forRoutes('*');
    } else {
      consumer.apply(HTTPAuthenticationMiddleware).forRoutes('*');
    }
  }

  static rawBodyBuffer(req: RequestWithLocals<unknown>, _res: Response, buffer: Buffer): void {
    if (buffer && buffer.length) {
      req.rawBody = buffer.toString();
    }
  }

  static register(options: HTTPAPIModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports, moduleClass } = options;
    const { atEnd: importsAtEnd, atStart: importsAtStart } = additionalImports || {};
    const { modules, services } = loadDynamicModules(folderData);
    return {
      module: moduleClass as DynamicModule['module'],
      imports: [...(importsAtStart || []), ...(modules || []), ...(importsAtEnd || [])],
      providers: [
        {
          provide: Constants.API_MODULE_NAME,
          useValue: options.moduleName
        },
        { provide: Constants.API_MODULE_ACP, useValue: [] },
        {
          provide: Constants.API_MODULE_ALLOWED_ORIGINS,
          useFactory: async (configProviderService: ConfigProviderService) =>
            (configProviderService.config.api![options.moduleName] as AppConfigAPIHTTP).allowedOrigins,
          inject: [ConfigProviderService]
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
      exports: [...(services || []), ...(options.exports || [])]
    };
  }
}
