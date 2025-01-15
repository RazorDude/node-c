import { DynamicModule, Inject, MiddlewareConsumer, Module } from '@nestjs/common';

import cookieParser from 'cookie-parser';
import express, { Response } from 'express';

import { APIModuleOptions } from './api.module.definitions';

import { ConfigProviderService } from '../../common/configProvider';
import { Constants, RequestWithLocals } from '../../common/definitions';
import { loadDynamicModules } from '../../common/utils';
import { AccessControlService } from '../../domain/iam/services';
import { HttpExceptionFilter } from '../exceptionFilters';
import { AuthorizationInterceptor, ErrorInterceptor } from '../interceptors';
import { AnonymousRoutesMiddleware, AuthenticationMiddleware, getCORSMiddleware } from '../middlewares';

@Module({})
export class APIModule {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    const moduleConfig = this.configProvider.config.api![this.moduleName];
    consumer.apply(express.urlencoded({ verify: APIModule.rawBodyBuffer, extended: true })).forRoutes('*');
    consumer.apply(express.json({ verify: APIModule.rawBodyBuffer })).forRoutes('*');
    consumer.apply(cookieParser()).forRoutes('*');
    consumer.apply(getCORSMiddleware(moduleConfig.allowedOrigins as string[])).forRoutes('*');
    const anonymousRoutes = moduleConfig.anonymousRoutes;
    if (anonymousRoutes && anonymousRoutes.length) {
      consumer.apply(AnonymousRoutesMiddleware).forRoutes(...anonymousRoutes);
      consumer
        .apply(AuthenticationMiddleware)
        .exclude(...anonymousRoutes)
        .forRoutes('*');
    } else {
      consumer.apply(AuthenticationMiddleware).forRoutes('*');
    }
  }

  static rawBodyBuffer(req: RequestWithLocals<unknown>, _res: Response, buffer: Buffer): void {
    if (buffer && buffer.length) {
      req.rawBody = buffer.toString();
    }
  }

  static register(options: APIModuleOptions): DynamicModule {
    const { folderData, imports: additionalImports } = options;
    const { atEnd: importsAtEnd, atStart: importsAtStart } = additionalImports || {};
    const { modules, services } = loadDynamicModules(folderData);
    return {
      module: APIModule,
      imports: [...(importsAtStart || []), ...(modules || []), ...(importsAtEnd || [])],
      providers: [
        {
          provide: Constants.API_MODULE_NAME,
          useValue: options.moduleName
        },
        {
          provide: Constants.API_MODULE_ACP,
          useFactory: async (accessControlService: AccessControlService) =>
            await accessControlService.mapAccessControlPoints(options.moduleName),
          inject: [AccessControlService]
        },
        {
          provide: Constants.AUTHORIZATION_INTERCEPTOR,
          useClass: AuthorizationInterceptor,
          // WTF, @nestjs's TypeScript?? :D
          inject: [Constants.API_MODULE_ACP] as unknown as undefined
        },
        {
          provide: Constants.ERROR_INTERCEPTOR,
          useClass: ErrorInterceptor
        },
        {
          provide: Constants.HTTP_EXCEPTION_FILTER,
          useClass: HttpExceptionFilter
        },
        ...(services || []),
        ...(options.providers || [])
      ],
      exports: [...(services || []), ...(options.exports || [])]
    };
  }
}
