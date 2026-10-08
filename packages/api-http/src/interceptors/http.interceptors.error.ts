import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor
} from '@nestjs/common';

import { ApplicationError, LoggerService } from '@node-c/core';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ServerError } from '../common/definitions/common.errors.js';
import { cleanUpAxiosError } from '../common/utils/utils.cleanUpAxiosError.js';

@Injectable()
export class HTTPErrorInterceptor implements NestInterceptor {
  constructor(protected logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        const loggableException = cleanUpAxiosError(error);
        this.logger.error(loggableException);
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
              status = HttpStatus.BAD_REQUEST;
            }
          } else {
            status = HttpStatus.BAD_REQUEST;
          }
        } else if (error.response) {
          const { response } = error;
          if (response.statusCode) {
            status = response.statusCode;
          }
          if (response.message) {
            message = response.message;
          }
        } else if (error instanceof Error && error.message) {
          message = error.message;
        }
        context
          .switchToHttp()
          .getResponse()
          .status(status)
          .json({
            error: Array.isArray(message) ? message.join('\n') : message,
            statusCode: status
          });
        return new Observable();
      })
    );
  }
}
