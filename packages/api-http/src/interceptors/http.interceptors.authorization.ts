import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestInterceptor
} from '@nestjs/common';

import { AuthorizationData, User as BaseUser, IAMAuthorizationService } from '@node-c/domain-iam';

import { setNested } from '@ramster/general-tools';
import { Observable } from 'rxjs';

import { Constants, RequestWithLocals } from '../common/definitions';

@Injectable()
export class HTTPAuthorizationInterceptor<User extends BaseUser<unknown, unknown>> implements NestInterceptor {
  constructor(
    @Inject(Constants.API_MODULE_ACP)
    // eslint-disable-next-line no-unused-vars
    protected authorizationData: AuthorizationData<unknown>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const [req]: [RequestWithLocals<User>, unknown] = context.getArgs();
    const locals = req.locals!;
    if (!locals) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    let controllerData = this.authorizationData![controllerName];
    if (!controllerData) {
      controllerData = this.authorizationData.__all;
    }
    const user = locals.user!; // we'll always have this, otherwise the system has not been configured properly
    let handlerData = controllerData[handlerName];
    if (!handlerData) {
      handlerData = controllerData.__all;
      if (!Object.keys(handlerData).length) {
        return next.handle();
      }
    }
    const { hasAccess, inputDataToBeMutated } = IAMAuthorizationService.checkAccess(
      handlerData,
      { body: req.body, headers: req.headers, params: req.params, query: req.query },
      user
    );
    if (!hasAccess) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    for (const key in inputDataToBeMutated) {
      setNested(req, key, inputDataToBeMutated[key]);
    }
    return next.handle();
  }
}
