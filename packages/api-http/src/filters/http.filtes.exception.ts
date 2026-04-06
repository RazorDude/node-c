import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

// The purpose of the class is to handle HttpExceptions that are not caught by the HTTPErrorInterceptor.
// @Catch(HttpException)
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
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
