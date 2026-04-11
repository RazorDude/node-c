import { HttpException } from '@nestjs/common';

export const cleanUpAxiosError = (exception: HttpException): HttpException => {
  let actualException = exception;
  // strip excessive axios error data
  if ('config' in actualException) {
    delete actualException.config;
  }
  if ('request' in actualException) {
    delete actualException.request;
  }
  if ('response' in actualException) {
    const actualExceptionResponse = (actualException as unknown as { response: { data?: unknown } }).response;
    if (actualExceptionResponse.data) {
      actualException = {
        ...actualException,
        response: { data: actualExceptionResponse.data }
      } as unknown as HttpException;
    } else {
      actualException = { ...actualException, response: undefined } as unknown as HttpException;
    }
  }
  return actualException;
};
