import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { LoggerService } from '@node-c/core';
import { Response } from 'express';

import { cleanUpAxiosError } from '../common/utils';

// The purpose of the class is to handle HttpExceptions that are not caught by the HTTPErrorInterceptor.
// @Catch(HttpException)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected logger: LoggerService
  ) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const loggableException = cleanUpAxiosError(exception);
    this.logger.error(loggableException);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      ('getStatus' in exception && exception.getStatus()) ||
      (exception as unknown as { status?: number })?.status ||
      500;
    response.status(status).json({
      error: exception.message,
      statusCode: status
    });
  }
}
