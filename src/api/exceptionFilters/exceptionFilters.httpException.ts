import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

// The purpose of the class is to handle HttpExceptions that are not caught by the ErrorInterceptor.
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    // else if (error instanceof BadRequestException) {
    //   const { statusCode, message: errorText } = error.getResponse() as unknown
    //   status = statusCode
    //   message = errorText || message
    // }
    response.status(status).json({
      statusCode: status,
      message: exception.message
    });
  }
}
