import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestInterceptor
} from '@nestjs/common';

import { ConfigProviderService, EndpointSecurityMode } from '@node-c/core';
import { AuthorizationPoint, IAMAuthorizationService, UserWithPermissionsData } from '@node-c/domain-iam';

import { setNested } from '@ramster/general-tools';
import { Observable } from 'rxjs';

import { Constants, RequestWithLocals } from '../common/definitions';

@Injectable()
export class HTTPAuthorizationInterceptor<User extends UserWithPermissionsData<unknown, unknown>>
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
    // TODO: cache this in-memory
    const authorizationData = await this.authorizationService.mapAuthorizationPoints(moduleName);
    let controllerData = authorizationData![controllerName];
    // console.log('===>', authorizationData);
    if (!controllerData) {
      controllerData = authorizationData.__all;
    }
    const user = locals.user!; // we'll always have this, otherwise the system has not been configured properly
    let handlerData = controllerData[handlerName];
    if (!handlerData) {
      handlerData = controllerData.__all;
      if (!Object.keys(handlerData).length) {
        const { endpointSecurityMode } = this.configProvider.config.api[moduleName];
        if (!endpointSecurityMode || endpointSecurityMode === EndpointSecurityMode.Strict) {
          console.info(
            `[${moduleName}][HTTPAuthorizationInterceptor]: No authorization point data for handler ${controllerName}.${handlerName}.`
          );
          throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        return next.handle();
      }
    }
    const { hasAccess, inputDataToBeMutated } = IAMAuthorizationService.checkAccess(
      handlerData,
      { body: req.body, headers: req.headers, params: req.params, query: req.query },
      user
    );
    if (!hasAccess) {
      console.info(
        `[${moduleName}][HTTPAuthorizationInterceptor]: No user access to handler ${controllerName}.${handlerName}.`
      );
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    for (const key in inputDataToBeMutated) {
      setNested(req, key, inputDataToBeMutated[key]);
    }
    return next.handle();
  }
}
