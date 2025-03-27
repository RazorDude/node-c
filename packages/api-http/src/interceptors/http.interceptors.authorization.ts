import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestInterceptor
} from '@nestjs/common';

import { AuthorizationPoint, User as BaseUser, IAMAuthorizationService } from '@node-c/domain-iam';

import { setNested } from '@ramster/general-tools';
import { Observable } from 'rxjs';

import { Constants, RequestWithLocals } from '../common/definitions';

@Injectable()
export class HTTPAuthorizationInterceptor<User extends BaseUser<unknown, unknown>> implements NestInterceptor {
  constructor(
    @Inject(Constants.API_MODULE_AUTHORIZATION_SERVICE)
    // eslint-disable-next-line no-unused-vars
    protected authorizationService: IAMAuthorizationService<AuthorizationPoint<unknown>>,
    @Inject(Constants.API_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    protected moduleName: string
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const [req]: [RequestWithLocals<User>, unknown] = context.getArgs();
    const locals = req.locals!;
    if (!locals) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    const authorizationData = await this.authorizationService.mapAuthorizationPoints(this.moduleName);
    let controllerData = authorizationData![controllerName];
    if (!controllerData) {
      controllerData = authorizationData.__all;
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
