import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestInterceptor
} from '@nestjs/common';

import { ConfigProviderService, GenericObject, setNested } from '@node-c/core';
import { AuthorizationPoint, IAMAuthorizationService, IAMUserManagerUserWithPermissionsData } from '@node-c/domain-iam';

import { Observable, map } from 'rxjs';

import { Constants, RequestWithLocals } from '../common/definitions';

/*
 * Authorization interceptor - used for role-based and fine-grained access control.
 */
@Injectable()
export class HTTPAccessControlInterceptor<User extends IAMUserManagerUserWithPermissionsData<unknown, unknown>>
  implements NestInterceptor
{
  constructor(
    @Inject(Constants.API_MODULE_AUTHORIZATION_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected authorizationService: IAMAuthorizationService<AuthorizationPoint<unknown>>,
    // eslint-disable-next-line no-unused-vars
    protected configProvider: ConfigProviderService,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const [req]: [RequestWithLocals<User>, unknown] = context.getArgs();
    const locals = req.locals!;
    if (!locals) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    } else if (locals.isAnonymous) {
      return next.handle();
    }
    const { moduleName } = this;
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const user = locals.user!; // we'll always have this, otherwise the system has not been configured properly
    const {
      authorizationPoints: usedAuthorizationPoints,
      errorCode,
      hasAccess,
      inputDataToBeMutated
    } = IAMAuthorizationService.checkAccess(
      { body: req.body, headers: req.headers, params: req.params, query: req.query },
      user,
      { moduleName, resource: handlerName, resourceContext: controllerName }
    );
    if (!hasAccess) {
      // TODO; restore this if it's actually needed
      // const { endpointSecurityMode } = this.configProvider.config.api[moduleName];
      // if (noMatchForResource && ) {
      // }
      // if (!endpointSecurityMode || endpointSecurityMode === EndpointSecurityMode.Strict) {
      //   console.info(
      //     `[${moduleName}][HTTPAccessControlInterceptor]: No authorization point data for handler ${controllerName}.${handlerName}.`
      //   );
      //   throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      // }
      console.error(
        `[${moduleName}][HTTPAccessControlInterceptor]: No user access to handler ${controllerName}.${handlerName} - ${errorCode}.`
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
