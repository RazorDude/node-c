import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import { GenericObject, LoggerService, Constants as NodeCCoreConstants, setNested } from '@node-c/core';
import {
  IAMAuthorizationService,
  IAMUserManagerUserWithPermissionsData,
  Constants as NodeCDomainIAMConstants
} from '@node-c/domain-iam';

import { Observable, map } from 'rxjs';

import { RequestWithLocals } from '../common/definitions';
import { AccessControlContext, AccessControlResource } from '../decorators';

/*
 * Authorization interceptor - used for role-based and fine-grained access control.
 */
@Injectable()
export class HTTPAccessControlInterceptor<
  User extends IAMUserManagerUserWithPermissionsData<unknown, unknown>
> implements NestInterceptor {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService,
    // eslint-disable-next-line no-unused-vars
    protected moduleRef: ModuleRef,
    // eslint-disable-next-line no-unused-vars
    protected reflector: Reflector
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const [req]: [RequestWithLocals<User>, unknown] = context.getArgs();
    const locals = req.locals!;
    if (!locals) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    } else if (locals.isAnonymous) {
      return next.handle();
    }
    const { logger, moduleRef, reflector } = this;
    const contextClass = context.getClass();
    const contextHandler = context.getHandler();
    const moduleName =
      moduleRef.get(NodeCDomainIAMConstants.ACCESS_CONTROL_MODULE_NAME) ||
      moduleRef.get(NodeCCoreConstants.API_MODULE_NAME);
    if (!moduleName) {
      logger.error(
        `[HTTPAccessControlInterceptor]: No moduleName configured for ${contextClass.name}.${contextHandler.name}.`
      );
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const resourceContextData = reflector.get(AccessControlContext, contextClass);
    const accessControlOptions = {
      moduleName,
      resource:
        reflector.get(AccessControlResource, contextHandler) ||
        (typeof resourceContextData !== 'string' && resourceContextData?.resourceMap?.[contextHandler.name]) ||
        contextHandler.name,
      resourceContext:
        (typeof resourceContextData === 'string' && resourceContextData) ||
        (typeof resourceContextData !== 'string' && resourceContextData?.context) ||
        contextClass.name
    };
    const user = locals.user!; // we'll always have this, otherwise the system has not been configured properly
    const {
      authorizationPoints: usedAuthorizationPoints,
      errorCode,
      hasAccess,
      inputDataToBeMutated
    } = IAMAuthorizationService.checkAccess(
      { body: req.body, headers: req.headers, params: req.params, query: req.query },
      user,
      accessControlOptions
    );
    if (!hasAccess) {
      logger.error(
        `[${moduleName}][HTTPAccessControlInterceptor]: No user access to resource ${accessControlOptions.moduleName}.${accessControlOptions.resourceContext}.${accessControlOptions.resource} - ${errorCode}.`
      );
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    for (const key in inputDataToBeMutated) {
      setNested(req, key, inputDataToBeMutated[key], { removeNestedFieldEscapeSign: true });
    }
    return next.handle().pipe(
      map((data?: unknown) => {
        if (typeof data === 'undefined' || data === null || typeof data !== 'object' || data instanceof Date) {
          return data;
        }
        const actualData = data as GenericObject;
        const { outputDataToBeMutated } = IAMAuthorizationService.processOutputData(
          usedAuthorizationPoints,
          actualData
        );
        for (const key in outputDataToBeMutated) {
          setNested(actualData, key, outputDataToBeMutated[key]);
        }
        return actualData;
      })
    );
  }
}
