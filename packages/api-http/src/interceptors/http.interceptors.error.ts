import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { ApplicationError, LoggerService } from '@node-c/core';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ServerError } from '../common/definitions/common.errors';

@Injectable()
export class HTTPErrorInterceptor implements NestInterceptor {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError(error => {
        this.logger.error(error);
        let message: string | string[] = 'An error has occurred.';
        let status = 500;
        if (error instanceof ApplicationError || error instanceof ServerError) {
          if (error.message) {
            message = error.message;
          }
          if (error.data) {
            if ('errorCode' in error.data) {
              status = error.data.errorCode as number;
            } else if ('statusCode' in error.data) {
              status = error.data.statusCode as number;
            } else {
              status = 400;
            }
          } else {
            status = 400;
          }
        } else if (error.response) {
          const { response } = error;
          if (response.statusCode) {
            status = response.statusCode;
          }
          if (response.message) {
            message = response.message;
          }
        } else if (error instanceof Error) {
          if (error.message) {
            message = error.message;
          }
        }
        context
          .switchToHttp()
          .getResponse()
          .status(status)
          .json({ error: message instanceof Array ? message.join('\n') : message });
        return new Observable();
      })
    );
  }
}
