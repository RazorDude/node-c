import { GenericObject } from '@node-c/core';

export enum ErrorCodes {
  // eslint-disable-next-line no-unused-vars
  AUTH_INVALID = 'AUTH_INVALID',
  // eslint-disable-next-line no-unused-vars
  AUTH_MISSING = 'AUTH_MISSING',
  // eslint-disable-next-line no-unused-vars
  ROUTE_NOT_ALLOWED = 'ROUTE_NOT_ALLOWED'
}

export class ServerError implements Error {
  data: { statusCode: number } | GenericObject;
  message: string;
  name: string;

  constructor(message: string, data?: GenericObject) {
    this.message = message;
    this.name = 'ServerError';
    this.data = data || {};
  }
}
