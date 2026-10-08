import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';

import { LoggerService } from '@node-c/core';

import { Response } from 'express';

import { cleanUpAxiosError } from '../common/utils/utils.cleanUpAxiosError.js';

/* The purpose of the class is to handle HttpExceptions that are not caught by the HTTPErrorInterceptor. */
// @Catch(HttpException)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(protected logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const loggableException = cleanUpAxiosError(exception);
    this.logger.error(loggableException);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      ('getStatus' in exception && exception.getStatus()) ||
      (exception as unknown as { status?: number } | undefined)?.status ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      error: exception.message,
      statusCode: status
    });
  }
}
